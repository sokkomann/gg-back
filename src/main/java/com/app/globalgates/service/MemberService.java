package com.app.globalgates.service;

import com.app.globalgates.common.enumeration.FileContentType;
import com.app.globalgates.common.enumeration.ProfileImageType;
import com.app.globalgates.common.exception.MemberLoginFailException;
import com.app.globalgates.common.exception.MemberNotFoundException;
import com.app.globalgates.dto.FileAdvertisementDTO;
import com.app.globalgates.dto.FileDTO;
import com.app.globalgates.dto.MemberDTO;
import com.app.globalgates.dto.MemberProfileFileDTO;
import com.app.globalgates.repository.BusinessMemberDAO;
import com.app.globalgates.repository.FileDAO;
import com.app.globalgates.repository.MemberDAO;
import com.app.globalgates.repository.MemberProfileFileDAO;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MemberService {
    private final MemberDAO memberDAO;
    private final MemberProfileFileDAO memberProfileFileDAO;
    private final BusinessMemberDAO businessMemberDAO;
    private final FileDAO fileDAO;
    private final PasswordEncoder passwordEncoder;

    //    회원가입
    public String join(MemberDTO memberDTO, MultipartFile profile){
        String path = getTodayPath();
        memberDTO.setMemberPassword(passwordEncoder.encode(memberDTO.getMemberPassword()));
        memberDAO.save(memberDTO);

        // 이미지가 있다면 저장
        if(!profile.isEmpty()) {
            UUID uuid = UUID.randomUUID();
            FileDTO fileDTO = new FileDTO();
            fileDTO.setOriginalName(profile.getOriginalFilename());
            fileDTO.setFileName(uuid.toString() + "_" + profile.getOriginalFilename());
            fileDTO.setFilePath(path);
            fileDTO.setFileSize(profile.getSize());
            fileDTO.setContentType(profile.getContentType().contains("image") ? FileContentType.IMAGE : FileContentType.ETC);
            fileDAO.save(fileDTO);

            MemberProfileFileDTO memberProfileFileDTO = new MemberProfileFileDTO();
            memberProfileFileDTO.setId(fileDTO.getId());
            memberProfileFileDTO.setMemberId(memberDTO.getId());
            memberProfileFileDTO.setProfileImageType(ProfileImageType.PROFILE);
            memberProfileFileDAO.save(memberProfileFileDTO);
        }

        // 광고 정보, 광고 이미지 등록 후 이미지 저장 경로 return
        return path;
    }


    //    로그인
    public MemberDTO login(MemberDTO memberDTO){
        return memberDAO.findMemberForLogin(memberDTO.toMemberVO()).orElseThrow(MemberLoginFailException::new);
    }

    //    회원정보 조회
    @Cacheable(value="member", key="#memberEmail")
    public MemberDTO getMember(String memberEmail){
        return memberDAO.findMemberByMemberEmail(memberEmail).orElseThrow(MemberNotFoundException::new);
    }

    // 오늘자 경로 생성
    public String getTodayPath(){
        return LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy/MM/dd"));
    }
}
