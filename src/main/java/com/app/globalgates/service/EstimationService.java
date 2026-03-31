package com.app.globalgates.service;

import com.app.globalgates.common.pagination.Criteria;
import com.app.globalgates.dto.EstimationDTO;
import com.app.globalgates.dto.EstimationTagDTO;
import com.app.globalgates.dto.EstimationWithPagingDTO;
import com.app.globalgates.repository.EstimationDAO;
import com.app.globalgates.repository.EstimationTagDAO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(rollbackFor = Exception.class)
public class EstimationService {
    private final EstimationDAO estimationDAO;
    private final EstimationTagDAO estimationTagDAO;

    public void write(EstimationDTO estimationDTO) {
        if (estimationDTO.getStatus() == null) {
            estimationDTO.setStatus("requesting");
        }

        estimationDTO.setTags(normalizeTags(estimationDTO.getTags()));
        estimationDAO.save(estimationDTO);

        estimationDTO.getTags().forEach(tagDTO -> {
            Optional<EstimationTagDTO> foundTag = estimationTagDAO.findByTagName(tagDTO.getTagName());

            if (foundTag.isEmpty()) {
                estimationTagDAO.save(tagDTO);
            } else {
                tagDTO.setId(foundTag.get().getId());
            }

            if (tagDTO.getId() == null) {
                tagDTO.setId(estimationTagDAO.findByTagName(tagDTO.getTagName()).orElseThrow().getId());
            }

            estimationTagDAO.saveRel(estimationDTO.getId(), tagDTO.getId());
        });
    }

    @Transactional(readOnly = true)
    public EstimationWithPagingDTO getList(int page) {
        Criteria criteria = new Criteria(page, estimationDAO.findTotal());
        List<EstimationDTO> estimations = estimationDAO.findAll(criteria);

        criteria.setHasMore(estimations.size() > criteria.getRowCount());
        if (criteria.isHasMore()) {
            estimations.remove(estimations.size() - 1);
        }

        estimations.forEach(estimationDTO ->
                estimationDTO.setTags(estimationTagDAO.findAllByEstimationId(estimationDTO.getId()))
        );

        EstimationWithPagingDTO estimationWithPagingDTO = new EstimationWithPagingDTO();
        estimationWithPagingDTO.setEstimations(estimations);
        estimationWithPagingDTO.setCriteria(criteria);
        return estimationWithPagingDTO;
    }

    @Transactional(readOnly = true)
    public Optional<EstimationDTO> getDetail(Long id) {
        Optional<EstimationDTO> estimation = estimationDAO.findById(id);
        estimation.ifPresent(estimationDTO ->
                estimationDTO.setTags(estimationTagDAO.findAllByEstimationId(estimationDTO.getId()))
        );
        return estimation;
    }

    private List<EstimationTagDTO> normalizeTags(List<EstimationTagDTO> tags) {
        if (tags == null) {
            return List.of();
        }

        return tags.stream()
                .filter(tagDTO -> tagDTO.getTagName() != null && !tagDTO.getTagName().isBlank())
                .collect(Collectors.toMap(
                        tagDTO -> tagDTO.getTagName().trim().replaceFirst("^#", ""),
                        tagDTO -> EstimationTagDTO.builder()
                                .id(tagDTO.getId())
                                .tagName(tagDTO.getTagName().trim().replaceFirst("^#", ""))
                                .build(),
                        (left, right) -> left
                ))
                .values()
                .stream()
                .collect(Collectors.toList());
    }
}
