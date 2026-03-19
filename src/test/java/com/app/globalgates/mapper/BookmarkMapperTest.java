package com.app.globalgates.mapper;

import com.app.globalgates.dto.BookmarkDTO;
import com.app.globalgates.dto.BookmarkFolderDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mybatis.spring.boot.test.autoconfigure.MybatisTest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class BookmarkMapperTest {

    @Autowired
    private BookmarkMapper bookmarkMapper;

    @Autowired
    private BookmarkFolderMapper bookmarkFolderMapper;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private Long memberId;
    private Long postId;

    @BeforeEach
    void setUp() {
        // 선행 데이터: member 삽입
        jdbcTemplate.update(
                "insert into tbl_member (member_email, member_password, member_nickname) values (?, ?, ?) on conflict (member_email) do nothing",
                "test@test.com", "password123", "테스트유저"
        );
        memberId = jdbcTemplate.queryForObject(
                "select id from tbl_member where member_email = ?", Long.class, "test@test.com"
        );

        // 선행 데이터: post 삽입
        jdbcTemplate.update(
                "insert into tbl_post (member_id, title, content) values (?, ?, ?)",
                memberId, "테스트 게시글", "테스트 내용"
        );
        postId = jdbcTemplate.queryForObject(
                "select id from tbl_post where member_id = ? order by id desc limit 1", Long.class, memberId
        );
    }

    @Test
    @DisplayName("북마크 생성 후 id가 자동 생성된다")
    void insert() {
        BookmarkDTO bookmarkDTO = new BookmarkDTO();
        bookmarkDTO.setMemberId(memberId);
        bookmarkDTO.setPostId(postId);

        bookmarkMapper.insert(bookmarkDTO);

        assertThat(bookmarkDTO.getId()).isNotNull();
    }

    @Test
    @DisplayName("id로 북마크를 조회할 수 있다")
    void selectById() {
        BookmarkDTO bookmarkDTO = new BookmarkDTO();
        bookmarkDTO.setMemberId(memberId);
        bookmarkDTO.setPostId(postId);
        bookmarkMapper.insert(bookmarkDTO);

        Optional<BookmarkDTO> result = bookmarkMapper.selectById(bookmarkDTO.getId());

        assertThat(result).isPresent();
        assertThat(result.get().getMemberId()).isEqualTo(memberId);
        assertThat(result.get().getPostId()).isEqualTo(postId);
    }

    @Test
    @DisplayName("회원/게시글 기준으로 북마크를 조회할 수 있다")
    void selectByMemberIdAndPostId() {
        BookmarkDTO bookmarkDTO = new BookmarkDTO();
        bookmarkDTO.setMemberId(memberId);
        bookmarkDTO.setPostId(postId);
        bookmarkMapper.insert(bookmarkDTO);

        Optional<BookmarkDTO> result = bookmarkMapper.selectByMemberIdAndPostId(memberId, postId);

        assertThat(result).isPresent();
        assertThat(result.get().getId()).isEqualTo(bookmarkDTO.getId());
    }

    @Test
    @DisplayName("북마크를 삭제할 수 있다")
    void delete() {
        BookmarkDTO bookmarkDTO = new BookmarkDTO();
        bookmarkDTO.setMemberId(memberId);
        bookmarkDTO.setPostId(postId);
        bookmarkMapper.insert(bookmarkDTO);

        bookmarkMapper.delete(bookmarkDTO.getId());

        assertThat(bookmarkMapper.selectById(bookmarkDTO.getId())).isEmpty();
    }

    @Test
    @DisplayName("북마크 폴더를 변경할 수 있다")
    void updateFolderId() {
        BookmarkFolderDTO folderDTO = new BookmarkFolderDTO();
        folderDTO.setMemberId(memberId);
        folderDTO.setFolderName("폴더");
        bookmarkFolderMapper.insert(folderDTO);

        BookmarkDTO bookmarkDTO = new BookmarkDTO();
        bookmarkDTO.setMemberId(memberId);
        bookmarkDTO.setPostId(postId);
        bookmarkMapper.insert(bookmarkDTO);

        bookmarkDTO.setFolderId(folderDTO.getId());
        bookmarkMapper.updateFolderId(bookmarkDTO);

        Optional<BookmarkDTO> result = bookmarkMapper.selectById(bookmarkDTO.getId());
        assertThat(result).isPresent();
        assertThat(result.get().getFolderId()).isEqualTo(folderDTO.getId());
    }

    @Test
    @DisplayName("회원의 북마크 목록을 조회할 수 있다")
    void selectAllByMemberId() {
        BookmarkDTO bookmarkDTO = new BookmarkDTO();
        bookmarkDTO.setMemberId(memberId);
        bookmarkDTO.setPostId(postId);
        bookmarkMapper.insert(bookmarkDTO);

        List<BookmarkDTO> result = bookmarkMapper.selectAllByMemberId(memberId);

        assertThat(result).isNotEmpty();
    }
}
