const PRODUCT_API = "/api/products";
const STOCK_API = "/api/stock-movements";
const DASHBOARD_API = "/api/dashboard";


let products = [];
let movements = [];


document.addEventListener("DOMContentLoaded", () => {

    setupNavigation();

    setupProductForm();

    setupStockForm();

    setupButtons();

    loadDashboard();

    loadProducts();

    loadMovements();

});


/* =====================================================
   NAVIGATION
===================================================== */

function setupNavigation() {

    const buttons =
        document.querySelectorAll(
            ".nav-btn, [data-section]"
        );


    buttons.forEach(button => {

        button.addEventListener("click", () => {

            const sectionId =
                button.dataset.section;

            if (!sectionId) {
                return;
            }

            showSection(sectionId);

        });

    });

}


function showSection(sectionId) {

    document
        .querySelectorAll(".section")
        .forEach(section => {

            section.classList.remove("active");

        });


    const section =
        document.getElementById(sectionId);


    if (section) {

        section.classList.add("active");

    }


    document
        .querySelectorAll(".nav-btn")
        .forEach(button => {

            button.classList.remove("active");

            if (
                button.dataset.section ===
                sectionId
            ) {

                button.classList.add("active");

            }

        });


    if (sectionId === "dashboardSection") {

        loadDashboard();

    }


    if (sectionId === "productsSection") {

        loadProducts();

    }


    if (sectionId === "stockSection") {

        loadProducts();

        loadMovements();

    }


    if (sectionId === "alertsSection") {

        loadProducts();

        loadMovements();

        setTimeout(loadAlerts, 100);

    }


    if (sectionId === "fastMovingSection") {

        loadMovements();

        setTimeout(loadFastMoving, 100);

    }

}


/* =====================================================
   BUTTONS
===================================================== */

function setupButtons() {

    const refreshProducts =
        document.getElementById(
            "refreshProductsButton"
        );

    if (refreshProducts) {

        refreshProducts.addEventListener(
            "click",
            loadProducts
        );

    }


    const refreshMovements =
        document.getElementById(
            "refreshMovementsButton"
        );

    if (refreshMovements) {

        refreshMovements.addEventListener(
            "click",
            loadMovements
        );

    }


    const closeDetails =
        document.getElementById(
            "closeDetailsButton"
        );

    if (closeDetails) {

        closeDetails.addEventListener(
            "click",
            () => {

                document
                    .getElementById("productDetails")
                    .classList.add("hidden");

            }
        );

    }


    const cancelButton =
        document.getElementById(
            "cancelButton"
        );

    if (cancelButton) {

        cancelButton.addEventListener(
            "click",
            resetProductForm
        );

    }


    const clearStock =
        document.getElementById(
            "clearStockButton"
        );

    if (clearStock) {

        clearStock.addEventListener(
            "click",
            () => {

                document
                    .getElementById("stockForm")
                    .reset();

            }
        );

    }

}


/* =====================================================
   DASHBOARD
===================================================== */

async function loadDashboard() {

    try {

        const response =
            await fetch(DASHBOARD_API);


        if (!response.ok) {

            throw new Error(
                "Dashboard API failed"
            );

        }


        const data =
            await response.json();


        document.getElementById(
            "totalProducts"
        ).textContent =
            data.totalProducts ?? 0;


        document.getElementById(
            "openAlerts"
        ).textContent =
            data.openReorderAlerts ?? 0;


        document.getElementById(
            "stockIn"
        ).textContent =
            data.totalStockIn ?? 0;


        document.getElementById(
            "stockOut"
        ).textContent =
            data.totalStockOut ?? 0;


        document.getElementById(
            "currentStock"
        ).textContent =
            data.currentStock ?? 0;


    } catch (error) {

        console.error(
            "Dashboard error:",
            error
        );

    }

}


/* =====================================================
   PRODUCT FORM
===================================================== */

function setupProductForm() {

    const form =
        document.getElementById(
            "productForm"
        );


    if (!form) {
        return;
    }


    form.addEventListener(
        "submit",
        saveProduct
    );

}


async function saveProduct(event) {

    event.preventDefault();


    const id =
        document.getElementById(
            "productId"
        ).value;


    const name =
        document.getElementById(
            "name"
        ).value.trim();


    const price =
        Number(
            document.getElementById(
                "price"
            ).value
        );


    const reorderThreshold =
        Number(
            document.getElementById(
                "reorderThreshold"
            ).value
        );


    const reorderQuantity =
        Number(
            document.getElementById(
                "reorderQuantity"
            ).value
        );


    const productData = {

        name: name,

        price: price,

        reorderThreshold:
        reorderThreshold,

        reorderQuantity:
        reorderQuantity

    };


    try {

        let response;


        if (id) {

            response =
                await fetch(
                    `${PRODUCT_API}/${id}`,
                    {

                        method: "PUT",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(
                                productData
                            )

                    }
                );

        } else {

            response =
                await fetch(
                    PRODUCT_API,
                    {

                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(
                                productData
                            )

                    }
                );

        }


        if (!response.ok) {

            const error =
                await response.text();

            throw new Error(error);

        }


        showToast(
            id
                ? "Product updated successfully!"
                : "Product created successfully!"
        );


        resetProductForm();

        await loadProducts();

        loadDashboard();


    } catch (error) {

        console.error(
            "Save product error:",
            error
        );


        alert(
            "Product save failed.\n\n" +
            error.message
        );

    }

}


/* =====================================================
   LOAD PRODUCTS
===================================================== */

async function loadProducts() {

    try {

        const response =
            await fetch(
                PRODUCT_API
            );


        if (!response.ok) {

            throw new Error(
                "Unable to load products"
            );

        }


        products =
            await response.json();


        renderProducts();

        loadStockProductDropdown();


    } catch (error) {

        console.error(
            "Load products error:",
            error
        );

    }

}


/* =====================================================
   RENDER PRODUCTS
===================================================== */

function renderProducts() {

    const tbody =
        document.getElementById(
            "productTableBody"
        );


    if (!tbody) {
        return;
    }


    tbody.innerHTML = "";


    if (
        !products ||
        products.length === 0
    ) {

        tbody.innerHTML = `

            <tr>

                <td colspan="6"
                    class="no-data">

                    No products found.

                </td>

            </tr>

        `;

        return;

    }


    products.forEach(product => {

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                ${product.id}
            </td>


            <td>
                <strong>
                    ${escapeHtml(product.name)}
                </strong>
            </td>


            <td>
                ₹${Number(product.price).toFixed(2)}
            </td>


            <td>
                ${product.reorderThreshold}
            </td>


            <td>
                ${product.reorderQuantity}
            </td>


            <td>

                <div class="action-buttons">

                    <button
                        class="view-btn"
                        data-action="view"
                        data-id="${product.id}">
                        👁 View
                    </button>


                    <button
                        class="edit-btn"
                        data-action="edit"
                        data-id="${product.id}">
                        ✏ Edit
                    </button>


                    <button
                        class="delete-btn"
                        data-action="delete"
                        data-id="${product.id}">
                        🗑 Delete
                    </button>

                </div>

            </td>

        `;


        tbody.appendChild(row);

    });


    setupProductActionButtons();

}


/* =====================================================
   PRODUCT ACTION BUTTONS
===================================================== */

function setupProductActionButtons() {

    document
        .querySelectorAll(
            "#productTableBody button"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const action =
                        button.dataset.action;


                    const id =
                        Number(
                            button.dataset.id
                        );


                    if (action === "view") {

                        viewProduct(id);

                    }


                    if (action === "edit") {

                        editProduct(id);

                    }


                    if (action === "delete") {

                        deleteProduct(id);

                    }

                }
            );

        });

}


/* =====================================================
   VIEW PRODUCT
===================================================== */

function viewProduct(id) {

    const product =
        products.find(
            p => p.id === id
        );


    if (!product) {

        alert(
            "Product not found."
        );

        return;

    }


    document.getElementById(
        "viewId"
    ).textContent =
        product.id;


    document.getElementById(
        "viewName"
    ).textContent =
        product.name;


    document.getElementById(
        "viewPrice"
    ).textContent =
        `₹${Number(
            product.price
        ).toFixed(2)}`;


    document.getElementById(
        "viewThreshold"
    ).textContent =
        product.reorderThreshold;


    document.getElementById(
        "viewQuantity"
    ).textContent =
        product.reorderQuantity;


    document
        .getElementById(
            "productDetails"
        )
        .classList.remove(
        "hidden"
    );


    document
        .getElementById(
            "productDetails"
        )
        .scrollIntoView({
            behavior: "smooth"
        });

}


/* =====================================================
   EDIT PRODUCT
===================================================== */

function editProduct(id) {

    const product =
        products.find(
            p => p.id === id
        );


    if (!product) {
        return;
    }


    document.getElementById(
        "productId"
    ).value =
        product.id;


    document.getElementById(
        "name"
    ).value =
        product.name;


    document.getElementById(
        "price"
    ).value =
        product.price;


    document.getElementById(
        "reorderThreshold"
    ).value =
        product.reorderThreshold;


    document.getElementById(
        "reorderQuantity"
    ).value =
        product.reorderQuantity;


    document.getElementById(
        "formTitle"
    ).textContent =
        "✏ Edit Product";


    document.getElementById(
        "saveButton"
    ).textContent =
        "💾 Update Product";


    document
        .getElementById(
            "cancelButton"
        )
        .classList.remove(
        "hidden"
    );


    document
        .getElementById(
            "productForm"
        )
        .scrollIntoView({
            behavior: "smooth"
        });

}


/* =====================================================
   DELETE PRODUCT
===================================================== */

async function deleteProduct(id) {

    const product =
        products.find(
            p => p.id === id
        );


    if (!product) {
        return;
    }


    const confirmed =
        confirm(
            `Delete "${product.name}"?`
        );


    if (!confirmed) {
        return;
    }


    try {

        const response =
            await fetch(
                `${PRODUCT_API}/${id}`,
                {
                    method: "DELETE"
                }
            );


        if (!response.ok) {

            const error =
                await response.text();

            throw new Error(error);

        }


        showToast(
            "Product deleted successfully!"
        );


        await loadProducts();

        await loadMovements();

        loadDashboard();


    } catch (error) {

        console.error(
            "Delete error:",
            error
        );


        alert(
            "Delete failed.\n\n" +
            "If this product has stock movements, " +
            "the database may prevent deletion."
        );

    }

}


/* =====================================================
   RESET PRODUCT FORM
===================================================== */

function resetProductForm() {

    document
        .getElementById(
            "productForm"
        )
        .reset();


    document.getElementById(
        "productId"
    ).value = "";


    document.getElementById(
        "formTitle"
    ).textContent =
        "➕ Add New Product";


    document.getElementById(
        "saveButton"
    ).textContent =
        "💾 Save Product";


    document
        .getElementById(
            "cancelButton"
        )
        .classList.add(
        "hidden"
    );

}


/* =====================================================
   STOCK PRODUCT DROPDOWN
===================================================== */

function loadStockProductDropdown() {

    const select =
        document.getElementById(
            "stockProduct"
        );


    if (!select) {
        return;
    }


    select.innerHTML =
        `<option value="">
            Select Product
        </option>`;


    products.forEach(product => {

        const option =
            document.createElement(
                "option"
            );


        option.value =
            product.id;


        option.textContent =
            `${product.name} - ₹${product.price}`;


        select.appendChild(
            option
        );

    });

}


/* =====================================================
   STOCK FORM
===================================================== */

function setupStockForm() {

    const form =
        document.getElementById(
            "stockForm"
        );


    if (!form) {
        return;
    }


    form.addEventListener(
        "submit",
        saveStockMovement
    );

}


async function saveStockMovement(event) {

    event.preventDefault();


    const productId =
        document.getElementById(
            "stockProduct"
        ).value;


    const movementType =
        document.getElementById(
            "movementType"
        ).value;


    const quantity =
        Number(
            document.getElementById(
                "quantity"
            ).value
        );


    const reason =
        document.getElementById(
            "reason"
        ).value.trim();


    if (!productId) {

        alert(
            "Please select a product."
        );

        return;

    }


    if (!movementType) {

        alert(
            "Please select movement type."
        );

        return;

    }


    if (
        !quantity ||
        quantity <= 0
    ) {

        alert(
            "Quantity must be greater than 0."
        );

        return;

    }


    try {

        const response =
            await fetch(
                `${STOCK_API}/product/${productId}`,
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({

                            movementType:
                            movementType,

                            quantity:
                            quantity,

                            reason:
                            reason

                        })

                }
            );


        if (!response.ok) {

            const error =
                await response.text();

            throw new Error(error);

        }


        showToast(
            "Stock movement added successfully!"
        );


        document
            .getElementById(
                "stockForm"
            )
            .reset();


        await loadMovements();

        loadDashboard();


    } catch (error) {

        console.error(
            "Stock movement error:",
            error
        );


        alert(
            "Stock movement failed.\n\n" +
            error.message
        );

    }

}


/* =====================================================
   LOAD MOVEMENTS
===================================================== */

async function loadMovements() {

    try {

        const response =
            await fetch(
                STOCK_API
            );


        if (!response.ok) {

            throw new Error(
                "Unable to load movements"
            );

        }


        movements =
            await response.json();


        renderMovements();


    } catch (error) {

        console.error(
            "Load movements error:",
            error
        );

    }

}


/* =====================================================
   RENDER MOVEMENTS
===================================================== */

function renderMovements() {

    const tbody =
        document.getElementById(
            "movementTableBody"
        );


    if (!tbody) {
        return;
    }


    tbody.innerHTML = "";


    if (
        !movements ||
        movements.length === 0
    ) {

        tbody.innerHTML = `

            <tr>

                <td colspan="6"
                    class="no-data">

                    No stock movements found.

                </td>

            </tr>

        `;

        return;

    }


    movements.forEach(movement => {

        const productName =
            movement.product?.name ??
            "Unknown Product";


        const type =
            movement.movementType ??
            "-";


        const date =
            movement.movementDate
                ? formatDate(
                    movement.movementDate
                )
                : "-";


        const typeClass =
            type === "IN"
                ? "stock-in"
                : "stock-out";


        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                ${movement.id ?? "-"}
            </td>


            <td>
                <strong>
                    ${escapeHtml(productName)}
                </strong>
            </td>


            <td>
                ${movement.quantity ?? 0}
            </td>


            <td>

                <span class="${typeClass}">
                    ${type === "IN"
            ? "📥 STOCK IN"
            : "📤 STOCK OUT"}
                </span>

            </td>


            <td>
                ${escapeHtml(
            movement.reason ?? "-"
        )}
            </td>


            <td>
                ${date}
            </td>

        `;


        tbody.appendChild(row);

    });

}


/* =====================================================
   ALERTS
===================================================== */

function loadAlerts() {

    const container =
        document.getElementById(
            "alertsContainer"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    if (
        products.length === 0
    ) {

        container.innerHTML =
            `<div class="no-data">
                No products available.
            </div>`;

        return;

    }


    let alertCount = 0;


    products.forEach(product => {

        const stock =
            calculateStock(
                product.id
            );


        if (
            stock <=
            product.reorderThreshold
        ) {

            alertCount++;


            const box =
                document.createElement(
                    "div"
                );


            box.className =
                "alert-box";


            box.innerHTML = `

                <h3>
                    🚨 ${escapeHtml(
                product.name
            )}
                </h3>


                <p>
                    <strong>Current Stock:</strong>
                    ${stock}
                </p>


                <p>
                    <strong>Reorder Threshold:</strong>
                    ${product.reorderThreshold}
                </p>


                <p>
                    <strong>Recommended Reorder:</strong>
                    ${product.reorderQuantity}
                </p>

            `;


            container.appendChild(
                box
            );

        }

    });


    if (alertCount === 0) {

        container.innerHTML =
            `<div class="no-data">
                ✅ No reorder alerts.
            </div>`;

    }

}


/* =====================================================
   FAST MOVING
===================================================== */

function loadFastMoving() {

    const container =
        document.getElementById(
            "fastMovingContainer"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    const map = {};


    movements.forEach(movement => {

        if (
            movement.movementType === "OUT" &&
            movement.product
        ) {

            const productId =
                movement.product.id;


            if (!map[productId]) {

                map[productId] = {

                    name:
                    movement.product.name,

                    quantity: 0

                };

            }


            map[productId].quantity +=
                Number(
                    movement.quantity || 0
                );

        }

    });


    const list =
        Object.values(map)
            .sort(
                (a, b) =>
                    b.quantity -
                    a.quantity
            );


    if (list.length === 0) {

        container.innerHTML =
            `<div class="no-data">
                No stock OUT data available.
            </div>`;

        return;

    }


    list.forEach(
        (item, index) => {

            const div =
                document.createElement(
                    "div"
                );


            div.className =
                "fast-moving-item";


            div.innerHTML = `

                <div class="fast-moving-left">

                    <div class="rank">
                        ${index + 1}
                    </div>


                    <div>

                        <h3>
                            ${escapeHtml(
                item.name
            )}
                        </h3>

                        <p>
                            Fast moving product
                        </p>

                    </div>

                </div>


                <div class="quantity-badge">

                    ${item.quantity}
                    units OUT

                </div>

            `;


            container.appendChild(
                div
            );

        }
    );

}


/* =====================================================
   CALCULATE STOCK
===================================================== */

function calculateStock(productId) {

    let stock = 0;


    movements.forEach(movement => {

        if (
            movement.product &&
            Number(
                movement.product.id
            ) === Number(productId)
        ) {

            const quantity =
                Number(
                    movement.quantity || 0
                );


            if (
                movement.movementType ===
                "IN"
            ) {

                stock += quantity;

            }


            if (
                movement.movementType ===
                "OUT"
            ) {

                stock -= quantity;

            }

        }

    });


    return stock;

}


/* =====================================================
   DATE FORMAT
===================================================== */

function formatDate(value) {

    try {

        return new Date(
            value
        ).toLocaleString();

    } catch {

        return value;

    }

}


/* =====================================================
   TOAST
===================================================== */

function showToast(message) {

    const toast =
        document.getElementById(
            "toast"
        );


    toast.textContent =
        message;


    toast.classList.add(
        "show"
    );


    setTimeout(() => {

        toast.classList.remove(
            "show"
        );

    }, 2500);

}


/* =====================================================
   HTML SAFETY
===================================================== */

function escapeHtml(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}