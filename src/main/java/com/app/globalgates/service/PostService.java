
package com.app.globalgates.service;

import com.app.globalgates.common.enumeration.FileContentType;
import com.app.globalgates.common.exception.PostNotFoundException;
import com.app.globalgates.common.pagination.Criteria;
import com.app.globalgates.domain.PostFileVO;
import com.app.globalgates.dto.FileDTO;
import com.app.globalgates.dto.PostDTO;
import com.app.globalgates.dto.PostFileDTO;
import com.app.globalgates.repository.FileDAO;
import com.app.globalgates.repository.PostDAO;
import com.app.globalgates.repository.PostFileDAO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(rollbackFor = Exception.class)
@Slf4j
public class PostService {
    private final PostDAO postDAO;
    private final PostFileDAO postFileDAO;
    private final FileDAO fileDAO;
    private final S3Service s3Service;

//    게시글 작성

    public String writePost(PostDTO postDTO, List<MultipartFile> files) {
        String path = getTodayPath();

        postDAO.save(postDTO);

        if(!files.isEmpty()) {
            files.forEach((file) -> {
                UUID uuid = UUID.randomUUID();
                FileDTO fileDTO = new FileDTO();
                fileDTO.setOriginalName(file.getOriginalFilename());
                fileDTO.setFileName(uuid.toString() + "_" + file.getOriginalFilename());
                fileDTO.setFilePath(path);
                fileDTO.setFileSize(file.getSize());
                fileDTO.setContentType(file.getContentType().contains("image") ? FileContentType.IMAGE
                        : file.getContentType().contains("video")
                        ? FileContentType.VIDEO : FileContentType.ETC);
                fileDAO.save(fileDTO);

                PostFileDTO postFileDTO = new PostFileDTO();
                postFileDTO.setId(fileDTO.getId());
                postFileDTO.setPostId(postDTO.getId());
                postFileDAO.save(postFileDTO.toPostFileVO());
            });
        }
        return path;
    }

    //    게시글 목록 조회
    public List<PostDTO> getList(int page) {
        Criteria criteria = new Criteria(page, postDAO.findTotal());
        List<PostDTO> posts = postDAO.findAll(criteria);

        posts.forEach(postDTO -> {
            postDTO.setPostFiles(postFileDAO.findAllByPostId(postDTO.getId()));
        });

        return posts;
    }

    //    게시글 단건 조회
    public PostDTO getDetail(Long id) {
        PostDTO postDTO = postDAO.findById(id)
                .orElseThrow(PostNotFoundException::new);

        postDTO.setPostFiles(postFileDAO.findAllByPostId(id));
        return postDTO;
    }

    //    게시글 수정
    public void update(PostDTO postDTO, List<MultipartFile> multipartFiles) {
        postDAO.setPost(postDTO.toPostVO());

        //    새 파일 추가
        multipartFiles.forEach(multipartFile -> {
            if (multipartFile.getOriginalFilename().isEmpty()) {
                return;
            }

            try {
                String fileName = s3Service.uploadFile(multipartFile, "post");

                FileDTO fileDTO = new FileDTO();
                fileDTO.setOriginalName(multipartFile.getOriginalFilename());
                fileDTO.setFileName(fileName);
                fileDTO.setFilePath("post");
                fileDTO.setFileSize(multipartFile.getSize());
                fileDAO.save(fileDTO);

                PostFileVO postFileVO = PostFileVO.builder()
                        .postId(postDTO.getId())
                        .fileId(fileDTO.getId())
                        .build();
                postFileDAO.save(postFileVO);
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
        });

        //    기존 파일 삭제 (S3 + DB)
        if (postDTO.getFileIdsToDelete() != null) {
            Arrays.stream(postDTO.getFileIdsToDelete()).forEach(fileId -> {
                fileDAO.findById(Long.valueOf(fileId)).ifPresent(fileVO -> {
                    s3Service.deleteFile(fileVO.getFileName());
                });
                postFileDAO.delete(Long.valueOf(fileId));
                fileDAO.delete(Long.valueOf(fileId));
            });
        }
    }

    //    게시글 삭제 = 상태 inactive로.
    public void delete(Long id) {
        postDAO.delete(id);
    }
    // 오늘자 경로 생성
    public String getTodayPath(){
        return LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy/MM/dd"));
    }
}