package com.example.stockalert.controller;

import com.example.stockalert.entity.Product;
import com.example.stockalert.entity.ReorderAlert;
import com.example.stockalert.entity.StockMovement;
import com.example.stockalert.repository.ProductRepository;
import com.example.stockalert.repository.ReorderAlertRepository;
import com.example.stockalert.repository.StockMovementRepository;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final ProductRepository productRepository;
    private final StockMovementRepository stockMovementRepository;
    private final ReorderAlertRepository reorderAlertRepository;

    public DashboardController(
            ProductRepository productRepository,
            StockMovementRepository stockMovementRepository,
            ReorderAlertRepository reorderAlertRepository) {

        this.productRepository = productRepository;
        this.stockMovementRepository = stockMovementRepository;
        this.reorderAlertRepository = reorderAlertRepository;
    }

    @GetMapping
    public Map<String, Object> getDashboard() {

        List<Product> products = productRepository.findAll();

        List<StockMovement> movements =
                stockMovementRepository.findAll();

        List<ReorderAlert> openAlerts =
                reorderAlertRepository.findByStatus("OPEN");

        int totalIn = 0;
        int totalOut = 0;

        for (StockMovement movement : movements) {

            if (movement.getMovementType()
                    .equalsIgnoreCase("IN")) {

                totalIn += movement.getQuantity();

            } else if (movement.getMovementType()
                    .equalsIgnoreCase("OUT")) {

                totalOut += movement.getQuantity();
            }
        }

        int currentStock = totalIn - totalOut;

        Map<String, Object> dashboard = new LinkedHashMap<>();

        dashboard.put("totalProducts", products.size());
        dashboard.put("openReorderAlerts", openAlerts.size());
        dashboard.put("totalStockIn", totalIn);
        dashboard.put("totalStockOut", totalOut);
        dashboard.put("currentStock", currentStock);

        return dashboard;
    }
}