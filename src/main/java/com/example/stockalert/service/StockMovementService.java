package com.example.stockalert.service;

import com.example.stockalert.entity.Product;
import com.example.stockalert.entity.StockMovement;
import com.example.stockalert.repository.ProductRepository;
import com.example.stockalert.repository.StockMovementRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class StockMovementService {

    private final StockMovementRepository stockMovementRepository;
    private final ProductRepository productRepository;

    public StockMovementService(
            StockMovementRepository stockMovementRepository,
            ProductRepository productRepository) {

        this.stockMovementRepository = stockMovementRepository;
        this.productRepository = productRepository;
    }


    // CREATE STOCK MOVEMENT
    public StockMovement createMovement(
            Long productId,
            StockMovement movement) {

        // Find product
        Product product = productRepository
                .findById(productId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Product not found with id: " + productId
                        )
                );


        // Connect movement with product
        movement.setProduct(product);


        // Set current date and time
        movement.setMovementDate(
                LocalDateTime.now()
        );


        // Validate quantity
        if (movement.getQuantity() == null ||
                movement.getQuantity() <= 0) {

            throw new RuntimeException(
                    "Quantity must be greater than 0"
            );
        }


        // Validate movement type
        if (movement.getMovementType() == null ||
                movement.getMovementType().trim().isEmpty()) {

            throw new RuntimeException(
                    "Movement type is required"
            );
        }


        // Save
        return stockMovementRepository.save(movement);
    }


    // GET ALL MOVEMENTS
    public List<StockMovement> getAllMovements() {

        return stockMovementRepository.findAll();
    }


    // GET MOVEMENTS BY PRODUCT
    public List<StockMovement> getMovementsByProduct(
            Long productId) {

        return stockMovementRepository
                .findByProductId(productId);
    }
}