package com.example.stockalert.controller;

import com.example.stockalert.entity.ReorderAlert;
import com.example.stockalert.service.ReorderAlertService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reorder-alerts")
public class ReorderAlertController {

    private final ReorderAlertService reorderAlertService;

    public ReorderAlertController(
            ReorderAlertService reorderAlertService) {

        this.reorderAlertService = reorderAlertService;
    }

    @GetMapping
    public ResponseEntity<List<ReorderAlert>> getAllAlerts() {

        return ResponseEntity.ok(
                reorderAlertService.getAllAlerts());
    }

    @GetMapping("/open")
    public ResponseEntity<List<ReorderAlert>> getOpenAlerts() {

        return ResponseEntity.ok(
                reorderAlertService.getOpenAlerts());
    }

    @PutMapping("/{id}/fulfill")
    public ResponseEntity<ReorderAlert> markFulfilled(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                reorderAlertService.markFulfilled(id));
    }
}
