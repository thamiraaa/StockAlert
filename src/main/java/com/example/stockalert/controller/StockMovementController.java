package com.example.stockalert.controller;

import com.example.stockalert.entity.StockMovement;
import com.example.stockalert.service.StockMovementService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stock-movements")
public class StockMovementController {

    private final StockMovementService stockMovementService;


    public StockMovementController(
            StockMovementService stockMovementService) {

        this.stockMovementService =
                stockMovementService;
    }


    @PostMapping("/product/{productId}")
    public ResponseEntity<StockMovement> createMovement(
            @PathVariable Long productId,
            @RequestBody StockMovement movement) {

        StockMovement savedMovement =
                stockMovementService.createMovement(
                        productId,
                        movement
                );

        return new ResponseEntity<>(
                savedMovement,
                HttpStatus.CREATED
        );
    }


    @GetMapping
    public ResponseEntity<List<StockMovement>>
    getAllMovements() {

        return ResponseEntity.ok(
                stockMovementService.getAllMovements()
        );
    }


    @GetMapping("/product/{productId}")
    public ResponseEntity<List<StockMovement>>
    getMovementsByProduct(
            @PathVariable Long productId) {

        return ResponseEntity.ok(
                stockMovementService
                        .getMovementsByProduct(productId)
        );
    }
}