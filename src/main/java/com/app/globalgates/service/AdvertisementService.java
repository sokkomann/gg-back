package com.app.globalgates.service;

import com.app.globalgates.common.enumeration.FileContentType;
import com.app.globalgates.common.exception.AdvertisementNotFoundException;
import com.app.globalgates.common.pagination.Criteria;
import com.app.globalgates.common.search.AdSearch;
import com.app.globalgates.domain.AdvertisementVO;
import com.app.globalgates.dto.AdWithPagingDTO;
import com.app.globalgates.dto.AdvertisementDTO;
import com.app.globalgates.dto.FileAdvertisementDTO;
import com.app.globalgates.dto.FileDTO;
import com.app.globalgates.repository.AdvertisementDAO;
import com.app.globalgates.repository.FileAdvertisementDAO;
import com.app.globalgates.repository.FileDAO;
import com.app.globalgates.util.DateUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdvertisementService {
    private final AdvertisementDAO advertisementDAO;
    private final FileDAO fileDAO;
    private final FileAdvertisementDAO fileAdvertisementDAO;

    // 광고 등록
    public String save(AdvertisementDTO advertisementDTO,
                     ArrayList<MultipartFile> images) {
        String path = getTodayPath();

        advertisementDAO.save(advertisementDTO);

        // 이미지가 있다면 저장
        if(!images.isEmpty()) {
            images.forEach(image -> {
                UUID uuid = UUID.randomUUID();
                FileDTO fileDTO = new FileDTO();
                fileDTO.setOriginalName(image.getOriginalFilename());
                fileDTO.setFileName(uuid.toString() + "_" + image.getOriginalFilename());
                fileDTO.setFilePath(path);
                fileDTO.setFileSize(image.getSize());
                fileDTO.setContentType(image.getContentType().contains("image") ? FileContentType.IMAGE : FileContentType.ETC);
                fileDAO.save(fileDTO);

                FileAdvertisementDTO fileAdDTO = new FileAdvertisementDTO();
                fileAdDTO.setId(fileDTO.getId());
                fileAdDTO.setAdId(advertisementDTO.getId());
                fileAdvertisementDAO.save(fileAdDTO.toFileAdVO());
            });
        }

        // 광고 정보, 광고 이미지 등록 후 이미지 저장 경로 return
        return path;
    }

    // 광고 전체 조회
    public List<AdvertisementDTO> getAllAds() {
        return advertisementDAO.findAll();
    }

    // 광고 조회 (검색값 없이 조회)
    public AdWithPagingDTO list(int page) {
        AdWithPagingDTO adWithPagingDTO = new AdWithPagingDTO();
        Criteria criteria = new Criteria(page, advertisementDAO.getTotal(null));

        // 이미지 등록
        List<AdvertisementDTO> ads = advertisementDAO.findBySearch(criteria, null).stream()
                .map(adDTO -> {
                    List<FileAdvertisementDTO> images = new ArrayList<>(fileAdvertisementDAO.findByAdId(adDTO.getId()));
                    if(!images.isEmpty()) { adDTO.setAdImageList(images); }
                    return adDTO;
                }).collect(Collectors.toList());

        criteria.setHasMore(ads.size() > criteria.getRowCount());
        adWithPagingDTO.setCriteria(criteria);

        if(criteria.isHasMore()) {
            ads.remove(ads.size() - 1);
        }

        ads.forEach(adDTO -> {
            adDTO.setCreatedDatetime(DateUtils.toRelativeTime(adDTO.getCreatedDatetime()));
        });
        adWithPagingDTO.setAdvertisements(ads);

        return adWithPagingDTO;
    }


    // 광고 검색 조회 (검색값 포함해서 조회)
    public AdWithPagingDTO list(int page, AdSearch search) {
        AdWithPagingDTO adWithPagingDTO = new AdWithPagingDTO();
        Criteria criteria = new Criteria(page, advertisementDAO.getTotal(search));

        // 이미지 등록
        List<AdvertisementDTO> ads = advertisementDAO.findBySearch(criteria, search).stream()
                .map(adDTO -> {
                    List<FileAdvertisementDTO> images = new ArrayList<>(fileAdvertisementDAO.findByAdId(adDTO.getId()));
                    if(!images.isEmpty()) { adDTO.setAdImageList(images); }
                    return adDTO;
                }).collect(Collectors.toList());

        criteria.setHasMore(ads.size() > criteria.getRowCount());
        adWithPagingDTO.setCriteria(criteria);

        if(criteria.isHasMore()) {
            ads.remove(ads.size() - 1);
        }

        ads.forEach(adDTO -> {
            adDTO.setCreatedDatetime(DateUtils.toRelativeTime(adDTO.getCreatedDatetime()));
        });
        adWithPagingDTO.setAdvertisements(ads);

        return adWithPagingDTO;
    }

    // 광고 상세 조회
    public AdvertisementDTO getAdvertisementDetail(Long id) {
        AdvertisementDTO adDetail = null;
        AdvertisementVO advertisementVO = advertisementDAO.findById(id).orElseThrow(AdvertisementNotFoundException::new);

        adDetail = toDTO(advertisementVO);

        // 이미지 찾아오기
        List<FileAdvertisementDTO> images = fileAdvertisementDAO.findByAdId(adDetail.getId());
        if(!images.isEmpty()) {
            adDetail.setAdImageList(images);
        }

        return adDetail;
    }


    // toDTO
    public AdvertisementDTO toDTO(AdvertisementVO adVO) {
        AdvertisementDTO adDTO = new AdvertisementDTO();
        adDTO.setId(adVO.getId());
        adDTO.setAdvertiserId(adVO.getAdvertiserId());
        adDTO.setTitle(adVO.getTitle());
        adDTO.setHeadline(adVO.getHeadline());
        adDTO.setDescription(adVO.getDescription());
        adDTO.setLandingUrl(adVO.getLandingUrl());
        adDTO.setBudget(adVO.getBudget());
        adDTO.setImpressionEstimate(adVO.getImpressionEstimate());
        adDTO.setReceiptId(adVO.getReceiptId());
        adDTO.setStatus(adVO.getStatus());
        adDTO.setCreatedDatetime(adVO.getCreatedDatetime());
        adDTO.setUpdatedDatetime(adVO.getUpdatedDatetime());

        return adDTO;
    }

    // 오늘자 경로 생성
    public String getTodayPath(){
        return LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy/MM/dd"));
    }
}
