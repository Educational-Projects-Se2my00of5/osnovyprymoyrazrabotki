package com.example.project.controller;

import com.example.project.dto.ResultDto;
import com.example.project.service.ResultService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class ResultController {

    private final ResultService resultService;

    @GetMapping("/api/results/my")
    @ResponseStatus(HttpStatus.OK)
    public List<ResultDto.ResultSummary> getMyResults(@RequestHeader("Authorization") String authHeader) {
        return resultService.getMyResults(authHeader);
    }

    @GetMapping("/api/projects/{projectId}/results")
    @ResponseStatus(HttpStatus.OK)
    public List<ResultDto.ResultSummary> getProjectResults(@RequestHeader("Authorization") String authHeader,
                                                           @PathVariable("projectId") Long projectId) {
        return resultService.getProjectResults(authHeader, projectId);
    }

    @GetMapping("/api/projects/{projectId}/results/my")
    @ResponseStatus(HttpStatus.OK)
    public List<ResultDto.ResultSummary> getMyResults(@RequestHeader("Authorization") String authHeader,
                                                      @PathVariable("projectId") Long projectId) {
        return resultService.getMyResultsInProject(authHeader, projectId);
    }

    @GetMapping("/api/projects/{projectId}/results/member/{memberId}")
    @ResponseStatus(HttpStatus.OK)
    public List<ResultDto.ResultSummary> getMemberResults(@RequestHeader("Authorization") String authHeader,
                                                          @PathVariable("projectId") Long projectId,
                                                          @PathVariable("memberId") Long memberId) {
        return resultService.getMemberResults(authHeader, projectId, memberId);
    }
}
