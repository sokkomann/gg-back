package com.app.globalgates.controller;

import com.app.globalgates.dto.AdvertisementDTO;
import com.app.globalgates.service.AdvertisementService;
import com.app.globalgates.service.S3Service;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/ad/**")
@Slf4j
public class AdvertisementAPIController {
    private final AdvertisementService advertisementService;
    private final S3Service s3Service;

//    광고 등록
    @PostMapping("write")
    public ResponseEntity<?> write(@RequestBody AdvertisementDTO advertisementDTO,
                                    @RequestParam("images") ArrayList<MultipartFile> images) throws IOException {
        log.info("advertisementDTO : {}", advertisementDTO);
        log.info("images : {}", images);
        String todayPath = advertisementService.save(advertisementDTO, images);

        if(!images.isEmpty()) {
            for(MultipartFile image : images) {
                s3Service.uploadFile(image, todayPath);
            }
        }

        return ResponseEntity.ok("광고 등록 성공!");
    }
}
