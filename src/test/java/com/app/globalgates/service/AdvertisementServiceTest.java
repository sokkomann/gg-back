package com.app.globalgates.service;

import com.app.globalgates.common.enumeration.FileContentType;
import com.app.globalgates.dto.AdvertisementDTO;
import com.app.globalgates.dto.FileAdvertisementDTO;
import com.app.globalgates.dto.FileDTO;
import com.app.globalgates.repository.AdvertisementDAO;
import com.app.globalgates.repository.FileAdvertisementDAO;
import com.app.globalgates.repository.FileDAO;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@SpringBootTest
@Slf4j
public class AdvertisementServiceTest {
    @Autowired
    private AdvertisementDAO advertisementDAO;
    @Autowired
    private FileDAO fileDAO;
    @Autowired
    private FileAdvertisementDAO fileAdvertisementDAO;


    @Test
    public void testWrite() {
        String path = getTodayPath();

        AdvertisementDTO adDTO = new AdvertisementDTO();
        adDTO.setAdvertiserId(1L);
        adDTO.setTitle("TEST AD 02");
        adDTO.setHeadline("TEST HEADLINE 02");
        adDTO.setDescription("TEST DESCRIPTION 02");
        adDTO.setLandingUrl("https://globalgates.com/ad/ljs");
        adDTO.setBudget(400000);
        adDTO.setImpressionEstimate(2000);
        adDTO.setStartedAt("2026-03-19");
        advertisementDAO.save(adDTO);

        FileDTO fileDTO = new FileDTO();
        fileDTO.setOriginalName("TEST 02");
        fileDTO.setFileName("TEST_IMAGE 02");
        fileDTO.setFilePath("/2026/03/19");
        fileDTO.setFileSize(400L);
        fileDTO.setContentType(FileContentType.IMAGE);
        fileDAO.save(fileDTO);

        FileAdvertisementDTO fileAdDTO = new FileAdvertisementDTO();
        fileAdDTO.setId(fileDTO.getId());
        fileAdDTO.setAdId(adDTO.getId());
        fileAdvertisementDAO.save(fileAdDTO.toFileAdVO());
    }

    @Test
    public void testGetAllAds() {
        List<AdvertisementDTO> foundAds = advertisementDAO.findAll();
        log.info("찾아온 광고들 : {}", foundAds);
    }


    // 오늘자 경로 생성
    public String getTodayPath(){
        return LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy/MM/dd"));
    }
}
