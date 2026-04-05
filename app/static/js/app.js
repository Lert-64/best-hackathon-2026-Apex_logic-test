'use strict';

class AppConfig {
    static get DRIVERS() {
        return [
            { id: 3, username: "driver_ivan" },
            { id: 4, username: "driver_petro" },
            { id: 5, username: "driver_teodor" },
            { id: 6, username: "driver_mykola" },
            { id: 7, username: "driver_andrii" },
            { id: 8, username: "driver_serhii" },
            { id: 9, username: "driver_dmytro" },
            { id: 10, username: "driver_oleksandr" }
        ];
    }
    static get WAREHOUSES() {
        return [
            { id: 1, name: "Склад А (Північ)", location_desc: "Північна магістраль, зручний під'їзд" },
            { id: 2, name: "Склад Б (Південь)", location_desc: "Південний Хаб, біля кордону" },
            { id: 3, name: "Склад В (Схід)", location_desc: "Східна промзона (небезпечна зона)" },
            { id: 4, name: "Склад Г (Захід)", location_desc: "Західний резерв" },
            { id: 5, name: "Склад Д (Центр)", location_desc: "Головний розподільчий центр" },
            { id: 6, name: "Склад Е (Об'їзна)", location_desc: "Резервний склад на об'їзній" },
            { id: 7, name: "Склад Є (Вокзал)", location_desc: "Близько до головного вокзалу Львова" },
            { id: 8, name: "Склад Ж (Аеропорт)", location_desc: "Близько до головного терміналу Льовова" }
        ];
    }
    static get DICTIONARY() {
        return {
            status: {
                'PENDING': 'В Очікуванні',
                'IN_PROGRESS': 'В Дорозі',
                'NEEDS_ATTENTION': 'Увага (ШІ)',
                'REROUTED': 'Змінено Маршрут',
                'COMPLETED': 'Завершено',
                'CANCELLED': 'Скасовано'
            },
            priority: {
                'NORMAL': 'Звичайний',
                'ELEVATED': 'Підвищений',
                'CRITICAL': 'Критичний'
            },
            icons: {
                'PENDING': '⏳',
                'IN_PROGRESS': '🚚',
                'NEEDS_ATTENTION': '⚠️',
                'REROUTED': '🔄',
                'COMPLETED': '✅',
                'CANCELLED': '❌'
            }
        };
    }
}

class DOMBuilder {
    static createElement(tag) {
        return document.createElement(tag);
    }
    static setAttribute(element, attributeName, attributeValue) {
        element.setAttribute(attributeName, attributeValue);
    }
    static addClass(element, className) {
        const classes = className.split(' ');
        for (let i = 0; i < classes.length; i++) {
            if (classes[i].trim() !== '') {
                element.classList.add(classes[i].trim());
            }
        }
    }
    static setText(element, text) {
        element.textContent = text;
    }
    static appendChild(parent, child) {
        parent.appendChild(child);
    }
}

class FormatHelper {
    static getWarehouseName(id) {
        const warehouses = AppConfig.WAREHOUSES;
        for (let i = 0; i < warehouses.length; i++) {
            if (warehouses[i].id === parseInt(id, 10)) {
                return warehouses[i].name;
            }
        }
        return `Склад #${id}`;
    }
    static getWarehouseLocation(id) {
        const warehouses = AppConfig.WAREHOUSES;
        for (let i = 0; i < warehouses.length; i++) {
            if (warehouses[i].id === parseInt(id, 10)) {
                return warehouses[i].location_desc;
            }
        }
        return `Локація не вказана`;
    }
    static getDriverName(id) {
        const drivers = AppConfig.DRIVERS;
        for (let i = 0; i < drivers.length; i++) {
            if (drivers[i].id === parseInt(id, 10)) {
                return drivers[i].username;
            }
        }
        return `Водій #${id}`;
    }
    static getCargoBadgeInfo(type) {
        if (type === 'MEDS') {
            return { bg: 'bg-red-50 text-red-700 border-red-200', icon: '💊 Медикаменти' };
        }
        if (type === 'FOOD') {
            return { bg: 'bg-green-50 text-green-700 border-green-200', icon: '🍎 Їжа' };
        }
        if (type === 'FUEL') {
            return { bg: 'bg-amber-50 text-amber-700 border-amber-200', icon: '⛽ Паливо' };
        }
        return { bg: 'bg-gray-50 text-gray-700 border-gray-200', icon: `📦 ${type}` };
    }
}

class SvgLibrary {
    static getCheckIcon() {
        return `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    }
    static getCrossIcon() {
        return `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
    }
    static getSettingsIcon() {
        return `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`;
    }
}

class NotificationService {
    constructor() {
        this.containerId = 'toast-container';
    }
    show(message, type = 'success', duration = 4000) {
        const container = document.getElementById(this.containerId);
        if (!container) {
            return;
        }
        const toast = DOMBuilder.createElement('div');
        let bgClass = 'bg-[#1A4B84]';
        let icon = 'ℹ';
        
        if (type === 'success') {
            bgClass = 'bg-green-600';
            icon = '✓';
        } else if (type === 'error') {
            bgClass = 'bg-red-600';
            icon = '✕';
        } else if (type === 'warning') {
            bgClass = 'bg-orange-500';
            icon = '⚠️';
        }
        
        DOMBuilder.addClass(toast, bgClass);
        DOMBuilder.addClass(toast, 'text-white');
        DOMBuilder.addClass(toast, 'px-6');
        DOMBuilder.addClass(toast, 'py-4');
        DOMBuilder.addClass(toast, 'rounded-xl');
        DOMBuilder.addClass(toast, 'font-bold');
        DOMBuilder.addClass(toast, 'text-sm');
        DOMBuilder.addClass(toast, 'shadow-2xl');
        DOMBuilder.addClass(toast, 'animate__animated');
        DOMBuilder.addClass(toast, 'animate__fadeInUp');
        DOMBuilder.addClass(toast, 'flex');
        DOMBuilder.addClass(toast, 'items-center');
        DOMBuilder.addClass(toast, 'gap-4');
        DOMBuilder.addClass(toast, 'min-w-[280px]');
        DOMBuilder.addClass(toast, 'pointer-events-auto');
        DOMBuilder.addClass(toast, 'cursor-pointer');
        DOMBuilder.addClass(toast, 'border');
        DOMBuilder.addClass(toast, 'border-white/10');
        
        const iconWrapper = DOMBuilder.createElement('span');
        DOMBuilder.addClass(iconWrapper, 'bg-white/20');
        DOMBuilder.addClass(iconWrapper, 'rounded-full');
        DOMBuilder.addClass(iconWrapper, 'w-8');
        DOMBuilder.addClass(iconWrapper, 'h-8');
        DOMBuilder.addClass(iconWrapper, 'flex');
        DOMBuilder.addClass(iconWrapper, 'items-center');
        DOMBuilder.addClass(iconWrapper, 'justify-center');
        DOMBuilder.addClass(iconWrapper, 'text-lg');
        DOMBuilder.addClass(iconWrapper, 'shrink-0');
        DOMBuilder.addClass(iconWrapper, 'shadow-inner');
        DOMBuilder.setText(iconWrapper, icon);
        
        const textWrapper = DOMBuilder.createElement('span');
        DOMBuilder.addClass(textWrapper, 'leading-snug');
        DOMBuilder.setText(textWrapper, message);
        
        DOMBuilder.appendChild(toast, iconWrapper);
        DOMBuilder.appendChild(toast, textWrapper);
        
        toast.addEventListener('click', () => {
            this.dismiss(toast);
        });
        
        DOMBuilder.appendChild(container, toast);
        
        if (duration > 0) {
            setTimeout(() => {
                this.dismiss(toast);
            }, duration);
        }
    }
    dismiss(toastElement) {
        if (!toastElement) {
            return;
        }
        if (!toastElement.parentNode) {
            return;
        }
        toastElement.classList.remove('animate__fadeInUp');
        toastElement.classList.add('animate__fadeOutDown');
        setTimeout(() => {
            if (toastElement.parentNode) {
                toastElement.parentNode.removeChild(toastElement);
            }
        }, 500);
    }
}

class ModalService {
    open(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('hidden-force');
            document.body.style.overflow = 'hidden';
        }
    }
    close(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('hidden-force');
            document.body.style.overflow = '';
            const forms = modal.querySelectorAll('form');
            for (let i = 0; i < forms.length; i++) {
                forms[i].reset();
            }
        }
    }
    closeAll() {
        const modals = document.querySelectorAll('[id$="-modal"]');
        for (let i = 0; i < modals.length; i++) {
            this.close(modals[i].id);
        }
    }
}

class ApiService {
    constructor(notificationService) {
        this.notification = notificationService;
    }
    getToken() {
        return localStorage.getItem('access_token');
    }
    async request(endpoint, method = 'GET', body = null) {
        const token = this.getToken();
        const headers = {};
        headers['Accept'] = 'application/json';
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        if (body) {
            headers['Content-Type'] = 'application/json';
        }
        const config = {};
        config.method = method;
        config.headers = headers;
        if (body) {
            config.body = JSON.stringify(body);
        }
        try {
            const response = await fetch(endpoint, config);
            if (response.status === 401) {
                if (window.location.pathname !== '/') {
                    this.notification.show('Сесія закінчилася. Будь ласка, увійдіть знову.', 'warning');
                    setTimeout(() => {
                        window.appController.handleLogout();
                    }, 1500);
                    return null;
                }
            }
            return response;
        } catch (error) {
            this.notification.show("Критична помилка мережі. Сервер недоступний.", "error");
            return null;
        }
    }
}

class TabService {
    constructor() {
        this.currentTab = 'orders';
    }
    switchTab(tabName) {
        this.currentTab = tabName;
        const allTabs = document.querySelectorAll('.tab-trigger');
        for (let i = 0; i < allTabs.length; i++) {
            allTabs[i].classList.remove('active');
            allTabs[i].classList.add('inactive');
        }
        const activeTabElement = document.getElementById(`tab-${tabName}`);
        if (activeTabElement) {
            activeTabElement.classList.remove('inactive');
            activeTabElement.classList.add('active');
        }
        const allContents = document.querySelectorAll('.tab-content');
        for (let j = 0; j < allContents.length; j++) {
            allContents[j].classList.add('hidden-force');
        }
        const activeContentElement = document.getElementById(`view-${tabName}`);
        if (activeContentElement) {
            activeContentElement.classList.remove('hidden-force');
            activeContentElement.style.display = 'flex';
        }
    }
    getCurrentTab() {
        return this.currentTab;
    }
}

class UIEventBinder {
    constructor(controller) {
        this.controller = controller;
    }
    bindAll() {
        this.bindLogout();
        this.bindTabs();
        this.bindModals();
        this.bindForms();
        this.bindCustomActions();
    }
    bindLogout() {
        const logoutBtn = document.getElementById('logout-button');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.controller.handleLogout();
            });
        }
    }
    bindTabs() {
        const tabs = document.querySelectorAll('.tab-trigger');
        for (let i = 0; i < tabs.length; i++) {
            tabs[i].addEventListener('click', (event) => {
                const targetId = event.currentTarget.getAttribute('data-target');
                if (targetId === 'view-orders') {
                    this.controller.handleTabSwitch('orders');
                } else if (targetId === 'view-warehouses') {
                    this.controller.handleTabSwitch('warehouses');
                }
            });
        }
    }
    bindModals() {
        const closeBtns = document.querySelectorAll('.modal-close-btn');
        for (let i = 0; i < closeBtns.length; i++) {
            closeBtns[i].addEventListener('click', (event) => {
                const targetModal = event.currentTarget.getAttribute('data-close-target');
                if (targetModal) {
                    this.controller.modalService.close(targetModal);
                }
            });
        }
        const createOrderBtn = document.getElementById('btn-create-order-open');
        if (createOrderBtn) {
            createOrderBtn.addEventListener('click', () => {
                this.controller.handleOpenCreateOrderModal();
            });
        }
        const deleteTriggerBtn = document.getElementById('btn-trigger-delete');
        if (deleteTriggerBtn) {
            deleteTriggerBtn.addEventListener('click', () => {
                this.controller.handleTriggerDeleteConfirm();
            });
        }
        const confirmDeleteBtn = document.getElementById('btn-confirm-delete');
        if (confirmDeleteBtn) {
            confirmDeleteBtn.addEventListener('click', () => {
                this.controller.executeDeleteOrder();
            });
        }
    }
    bindForms() {
        const createOrderForm = document.getElementById('create-order-form');
        if (createOrderForm) {
            createOrderForm.addEventListener('submit', (event) => {
                this.controller.submitCreateOrder(event);
            });
        }
        const originSelect = document.getElementById('create_origin_id');
        if (originSelect) {
            originSelect.addEventListener('change', () => {
                this.controller.handleOriginChange();
            });
        }
        const editOrderForm = document.getElementById('edit-order-form');
        if (editOrderForm) {
            editOrderForm.addEventListener('submit', (event) => {
                this.controller.submitEditOrder(event);
            });
        }
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (event) => {
                this.controller.handleLoginSubmit(event);
            });
        }
        const sosForm = document.getElementById('sos-form');
        if (sosForm) {
            sosForm.addEventListener('submit', (event) => {
                this.controller.submitSosForm(event);
            });
        }
    }
    bindCustomActions() {
        const refreshInvBtn = document.getElementById('btn-refresh-inventory');
        if (refreshInvBtn) {
            refreshInvBtn.addEventListener('click', () => {
                this.controller.handleInventoryRefresh(refreshInvBtn);
            });
        }
        const refreshDriverBtn = document.getElementById('btn-refresh-driver');
        if (refreshDriverBtn) {
            refreshDriverBtn.addEventListener('click', () => {
                this.controller.handleDriverRefresh(refreshDriverBtn);
            });
        }
        
        // Ці бінди також оновлюються динамічно у fetchAndRenderDriverScreen,
        // але залишаємо їх тут для страховки.
        const sosOpenBtn = document.getElementById('btn-open-sos');
        if (sosOpenBtn) {
            sosOpenBtn.addEventListener('click', () => {
                this.controller.openSosModal();
            });
        }
        const driverAcceptBtn = document.getElementById('btn-driver-accept');
        if (driverAcceptBtn) {
            driverAcceptBtn.addEventListener('click', () => {
                this.controller.updateDriverStatus('accept');
            });
        }
        const driverCompleteBtn = document.getElementById('btn-driver-complete');
        if (driverCompleteBtn) {
            driverCompleteBtn.addEventListener('click', () => {
                this.controller.updateDriverStatus('complete');
            });
        }
    }
}

class CoreController {
    constructor() {
        this.notificationService = new NotificationService();
        this.modalService = new ModalService();
        this.apiService = new ApiService(this.notificationService);
        this.tabService = new TabService();
        this.eventBinder = new UIEventBinder(this);
        this.state = {};
        this.state.orders = [];
        this.state.inventory = [];
        this.state.selectedOrderIdForEdit = null;
        this.state.currentDriverOrderId = null;
        this.intervals = [];
    }
    initialize() {
        this.eventBinder.bindAll();
        const currentPath = window.location.pathname;
        if (currentPath === '/dispatcher') {
            const token = this.apiService.getToken();
            if (!token) {
                this.handleLogout();
                return;
            }
            this.initializeDispatcher();
        } else if (currentPath === '/driver') {
            const token = this.apiService.getToken();
            if (!token) {
                this.handleLogout();
                return;
            }
            this.initializeDriver();
        } else {
            this.clearAllIntervals();
        }
    }
    clearAllIntervals() {
        for (let i = 0; i < this.intervals.length; i++) {
            clearInterval(this.intervals[i]);
        }
        this.intervals = [];
    }
    handleLogout() {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        this.clearAllIntervals();
        window.location.href = '/';
    }
    initializeDispatcher() {
        this.handleTabSwitch('orders');
        this.populateDispatcherDropdowns();
        const pollingTimer = setInterval(() => {
            const activeTab = this.tabService.getCurrentTab();
            if (activeTab === 'orders') {
                this.fetchAndRenderOrders();
            } else if (activeTab === 'warehouses') {
                this.fetchAndRenderInventory();
            }
        }, 10000);
        this.intervals.push(pollingTimer);
    }
    handleTabSwitch(tabName) {
        this.tabService.switchTab(tabName);
        if (tabName === 'orders') {
            this.fetchAndRenderOrders();
        } else if (tabName === 'warehouses') {
            this.fetchAndRenderInventory();
        }
    }
    populateDispatcherDropdowns() {
        const driverSelect = document.getElementById('create_driver_id');
        const originSelect = document.getElementById('create_origin_id');
        const destSelect = document.getElementById('create_destination_id');
        if (driverSelect) {
            driverSelect.innerHTML = '';
            const defaultDriverOption = DOMBuilder.createElement('option');
            DOMBuilder.setAttribute(defaultDriverOption, 'value', '');
            DOMBuilder.setAttribute(defaultDriverOption, 'disabled', 'true');
            DOMBuilder.setAttribute(defaultDriverOption, 'selected', 'true');
            DOMBuilder.setText(defaultDriverOption, 'Виберіть водія...');
            DOMBuilder.appendChild(driverSelect, defaultDriverOption);
            const driversList = AppConfig.DRIVERS;
            for (let i = 0; i < driversList.length; i++) {
                const opt = DOMBuilder.createElement('option');
                DOMBuilder.setAttribute(opt, 'value', driversList[i].id.toString());
                DOMBuilder.setText(opt, driversList[i].username);
                DOMBuilder.appendChild(driverSelect, opt);
            }
        }
        if (originSelect) {
            originSelect.innerHTML = '';
            const defaultOriginOption = DOMBuilder.createElement('option');
            DOMBuilder.setAttribute(defaultOriginOption, 'value', '');
            DOMBuilder.setAttribute(defaultOriginOption, 'disabled', 'true');
            DOMBuilder.setAttribute(defaultOriginOption, 'selected', 'true');
            DOMBuilder.setText(defaultOriginOption, 'Виберіть склад відправлення...');
            DOMBuilder.appendChild(originSelect, defaultOriginOption);
            const warehousesList = AppConfig.WAREHOUSES;
            for (let i = 0; i < warehousesList.length; i++) {
                const opt = DOMBuilder.createElement('option');
                DOMBuilder.setAttribute(opt, 'value', warehousesList[i].id.toString());
                DOMBuilder.setText(opt, warehousesList[i].name);
                DOMBuilder.appendChild(originSelect, opt);
            }
        }
        if (destSelect) {
            destSelect.innerHTML = '';
            const defaultDestOption = DOMBuilder.createElement('option');
            DOMBuilder.setAttribute(defaultDestOption, 'value', '');
            DOMBuilder.setAttribute(defaultDestOption, 'disabled', 'true');
            DOMBuilder.setAttribute(defaultDestOption, 'selected', 'true');
            DOMBuilder.setText(defaultDestOption, 'Виберіть склад призначення...');
            DOMBuilder.appendChild(destSelect, defaultDestOption);
            const warehousesListDest = AppConfig.WAREHOUSES;
            for (let i = 0; i < warehousesListDest.length; i++) {
                const opt = DOMBuilder.createElement('option');
                DOMBuilder.setAttribute(opt, 'value', warehousesListDest[i].id.toString());
                DOMBuilder.setText(opt, warehousesListDest[i].name);
                DOMBuilder.appendChild(destSelect, opt);
            }
        }
    }
    handleOriginChange() {
        const originSelect = document.getElementById('create_origin_id');
        const destSelect = document.getElementById('create_destination_id');
        if (!originSelect) {
            return;
        }
        if (!destSelect) {
            return;
        }
        const originValue = originSelect.value;
        const destOptions = destSelect.options;
        for (let i = 0; i < destOptions.length; i++) {
            const opt = destOptions[i];
            if (opt.value === originValue && opt.value !== "") {
                opt.disabled = true;
                if (destSelect.value === originValue) {
                    destSelect.value = "";
                }
            } else {
                opt.disabled = false;
            }
        }
    }
    handleOpenCreateOrderModal() {
        const createOrderForm = document.getElementById('create-order-form');
        if (createOrderForm) {
            createOrderForm.reset();
        }
        this.populateDispatcherDropdowns();
        this.modalService.open('order-modal');
    }
    async submitCreateOrder(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const formObject = {};
        for (const [key, value] of formData.entries()) {
            formObject[key] = value;
        }
        const body = {};
        body.driver_id = parseInt(formObject.driver_id, 10);
        body.origin_id = parseInt(formObject.origin_id, 10);
        body.destination_id = parseInt(formObject.destination_id, 10);
        body.cargo_type = formObject.cargo_type;
        body.cargo_quantity = parseFloat(formObject.cargo_quantity);
        body.priority = formObject.priority;
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Збереження...';
        submitBtn.disabled = true;
        try {
            const response = await this.apiService.request('/api/dispatcher/orders', 'POST', body);
            if (response && response.ok) {
                this.notificationService.show('Новий рейс успішно зарезервовано та створено!', 'success');
                this.modalService.close('order-modal');
                this.fetchAndRenderOrders();
            } else {
                this.notificationService.show('Помилка створення рейсу. Можливо, недостатньо товару на складі.', 'error');
            }
        } catch (error) {
            this.notificationService.show('Сталася помилка при відправці запиту.', 'error');
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }
    async fetchAndRenderOrders() {
        const response = await this.apiService.request('/api/dispatcher/orders', 'GET');
        if (!response || !response.ok) {
            return;
        }
        try {
            const ordersData = await response.json();
            this.state.orders = ordersData;
            this.renderOrdersTable(ordersData);
        } catch (error) {
            this.notificationService.show('Не вдалося розібрати відповідь сервера.', 'error');
        }
    }
    renderOrdersTable(ordersList) {
        const tableBody = document.getElementById('orders-table-body');
        const aiAlertsContainer = document.getElementById('ai-alerts-container');
        const aiEmptyState = document.getElementById('ai-empty-state');
        if (!tableBody) {
            return;
        }
        tableBody.innerHTML = '';
        if (aiAlertsContainer) {
            aiAlertsContainer.innerHTML = '';
        }
        let hasActiveAlerts = false;
        if (!ordersList || ordersList.length === 0) {
            const emptyRow = DOMBuilder.createElement('tr');
            const emptyCell = DOMBuilder.createElement('td');
            DOMBuilder.setAttribute(emptyCell, 'colspan', '7');
            DOMBuilder.addClass(emptyCell, 'p-10 text-center text-gray-400 font-extrabold uppercase tracking-widest text-sm');
            DOMBuilder.setText(emptyCell, 'Активних рейсів немає');
            DOMBuilder.appendChild(emptyRow, emptyCell);
            DOMBuilder.appendChild(tableBody, emptyRow);
            if (aiEmptyState) {
                aiEmptyState.style.display = 'block';
            }
            return;
        }
        for (let i = 0; i < ordersList.length; i++) {
            const orderObj = ordersList[i];
            const isAlertState = orderObj.status === 'NEEDS_ATTENTION';
            if (isAlertState) {
                hasActiveAlerts = true;
            }
            const tr = DOMBuilder.createElement('tr');
            let rowBackgroundClass = 'hover:bg-gray-50';
            if (isAlertState) {
                rowBackgroundClass = 'bg-red-50/40 hover:bg-red-50';
            }
            DOMBuilder.addClass(tr, `${rowBackgroundClass} transition-colors border-b border-gray-100 last:border-0`);
            const tdId = DOMBuilder.createElement('td');
            DOMBuilder.addClass(tdId, 'p-5 font-black text-gray-400 text-xs');
            DOMBuilder.setText(tdId, `#${orderObj.id}`);
            DOMBuilder.appendChild(tr, tdId);
            const tdDriver = DOMBuilder.createElement('td');
            DOMBuilder.addClass(tdDriver, 'p-5 font-extrabold text-gray-900');
            DOMBuilder.setText(tdDriver, FormatHelper.getDriverName(orderObj.driver_id));
            DOMBuilder.appendChild(tr, tdDriver);
            const tdRoute = DOMBuilder.createElement('td');
            DOMBuilder.addClass(tdRoute, 'p-5 text-sm');
            const routeDiv = DOMBuilder.createElement('div');
            DOMBuilder.addClass(routeDiv, 'flex items-center gap-2 font-bold text-gray-600');
            const spanOrigin = DOMBuilder.createElement('span');
            DOMBuilder.setText(spanOrigin, FormatHelper.getWarehouseName(orderObj.origin_id));
            const spanArrow = DOMBuilder.createElement('span');
            DOMBuilder.addClass(spanArrow, 'text-gray-300');
            DOMBuilder.setText(spanArrow, '→');
            const spanDest = DOMBuilder.createElement('span');
            DOMBuilder.addClass(spanDest, 'text-[#1A4B84]');
            DOMBuilder.setText(spanDest, FormatHelper.getWarehouseName(orderObj.destination_id));
            DOMBuilder.appendChild(routeDiv, spanOrigin);
            DOMBuilder.appendChild(routeDiv, spanArrow);
            DOMBuilder.appendChild(routeDiv, spanDest);
            DOMBuilder.appendChild(tdRoute, routeDiv);
            DOMBuilder.appendChild(tr, tdRoute);
            const tdCargo = DOMBuilder.createElement('td');
            DOMBuilder.addClass(tdCargo, 'p-5');
            const cargoTypeDiv = DOMBuilder.createElement('div');
            DOMBuilder.addClass(cargoTypeDiv, 'font-extrabold text-xs text-gray-900 uppercase');
            DOMBuilder.setText(cargoTypeDiv, orderObj.cargo_type);
            const cargoQtyDiv = DOMBuilder.createElement('div');
            DOMBuilder.addClass(cargoQtyDiv, 'text-[11px] font-bold text-gray-500 mt-0.5');
            DOMBuilder.setText(cargoQtyDiv, `${orderObj.cargo_quantity} од.`);
            DOMBuilder.appendChild(tdCargo, cargoTypeDiv);
            DOMBuilder.appendChild(tdCargo, cargoQtyDiv);
            DOMBuilder.appendChild(tr, tdCargo);
            const tdPriority = DOMBuilder.createElement('td');
            DOMBuilder.addClass(tdPriority, 'p-5');
            const spanPriority = DOMBuilder.createElement('span');
            const priorityClass = `PR-${orderObj.priority}`;
            DOMBuilder.addClass(spanPriority, `px-3 py-1.5 rounded-md text-[10px] font-black uppercase ${priorityClass}`);
            const prioDict = AppConfig.DICTIONARY.priority;
            let prioText = orderObj.priority;
            if (prioDict[orderObj.priority]) {
                prioText = prioDict[orderObj.priority];
            }
            DOMBuilder.setText(spanPriority, prioText);
            DOMBuilder.appendChild(tdPriority, spanPriority);
            DOMBuilder.appendChild(tr, tdPriority);
            const tdStatus = DOMBuilder.createElement('td');
            DOMBuilder.addClass(tdStatus, 'p-5');
            const spanStatus = DOMBuilder.createElement('span');
            const statusClass = `ST-${orderObj.status}`;
            DOMBuilder.addClass(spanStatus, `status-badge ${statusClass}`);
            const statusDict = AppConfig.DICTIONARY.status;
            let statusText = orderObj.status;
            if (statusDict[orderObj.status]) {
                statusText = statusDict[orderObj.status];
            }
            const iconDict = AppConfig.DICTIONARY.icons;
            let iconText = '📦';
            if (iconDict[orderObj.status]) {
                iconText = iconDict[orderObj.status];
            }
            spanStatus.innerHTML = `${iconText} ${statusText}`;
            DOMBuilder.appendChild(tdStatus, spanStatus);
            DOMBuilder.appendChild(tr, tdStatus);
            const tdActions = DOMBuilder.createElement('td');
            DOMBuilder.addClass(tdActions, 'p-5 text-right');
            if (isAlertState && orderObj.ai_proposed_action) {
                const actionsWrapper = DOMBuilder.createElement('div');
                DOMBuilder.addClass(actionsWrapper, 'flex justify-end gap-2');
                const btnApprove = DOMBuilder.createElement('button');
                DOMBuilder.addClass(btnApprove, 'p-2.5 bg-green-100 text-green-700 rounded-xl hover:bg-green-200 transition-colors shadow-sm');
                DOMBuilder.setAttribute(btnApprove, 'title', 'Затвердити ШІ-рішення');
                btnApprove.innerHTML = SvgLibrary.getCheckIcon();
                btnApprove.addEventListener('click', () => {
                    this.executeAiDecision(orderObj.id, 'approve');
                });
                const btnReject = DOMBuilder.createElement('button');
                DOMBuilder.addClass(btnReject, 'p-2.5 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-colors shadow-sm');
                DOMBuilder.setAttribute(btnReject, 'title', 'Відхилити ШІ-рішення');
                btnReject.innerHTML = SvgLibrary.getCrossIcon();
                btnReject.addEventListener('click', () => {
                    this.executeAiDecision(orderObj.id, 'reject');
                });
                DOMBuilder.appendChild(actionsWrapper, btnApprove);
                DOMBuilder.appendChild(actionsWrapper, btnReject);
                DOMBuilder.appendChild(tdActions, actionsWrapper);
            } else {
                const btnEdit = DOMBuilder.createElement('button');
                DOMBuilder.addClass(btnEdit, 'text-gray-400 hover:text-orange-500 transition-colors p-2.5 bg-white border border-gray-200 hover:border-orange-200 hover:bg-orange-50 rounded-xl shadow-sm');
                DOMBuilder.setAttribute(btnEdit, 'title', 'Налаштування рейсу');
                btnEdit.innerHTML = SvgLibrary.getSettingsIcon();
                btnEdit.addEventListener('click', () => {
                    this.openEditOrderModal(orderObj.id);
                });
                DOMBuilder.appendChild(tdActions, btnEdit);
            }
            DOMBuilder.appendChild(tr, tdActions);
            DOMBuilder.appendChild(tableBody, tr);
            if (isAlertState && orderObj.ai_proposed_action && aiAlertsContainer) {
                this.renderAiAlertCard(orderObj, aiAlertsContainer);
            }
        }
        if (aiEmptyState) {
            if (hasActiveAlerts) {
                aiEmptyState.style.display = 'none';
            } else {
                aiEmptyState.style.display = 'block';
            }
        }
    }
    renderAiAlertCard(orderObj, containerElement) {
        const cardDiv = DOMBuilder.createElement('div');
        DOMBuilder.addClass(cardDiv, 'bg-white border-2 border-red-200 p-6 rounded-[24px] shadow-sm flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 animate__animated animate__fadeInDown');
        const flexContainer = DOMBuilder.createElement('div');
        DOMBuilder.addClass(flexContainer, 'flex gap-5 items-start w-full');
        const iconDiv = DOMBuilder.createElement('div');
        DOMBuilder.addClass(iconDiv, 'w-16 h-16 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-center text-3xl shrink-0 shadow-inner');
        DOMBuilder.setText(iconDiv, '🚨');
        const contentDiv = DOMBuilder.createElement('div');
        DOMBuilder.addClass(contentDiv, 'w-full');
        const headerDiv = DOMBuilder.createElement('div');
        DOMBuilder.addClass(headerDiv, 'flex items-center gap-3 mb-2 flex-wrap');
        const orderIdSpan = DOMBuilder.createElement('span');
        DOMBuilder.addClass(orderIdSpan, 'text-[10px] font-black bg-gray-900 text-white px-3 py-1 rounded-md uppercase tracking-widest');
        DOMBuilder.setText(orderIdSpan, `Рейс #${orderObj.id}`);
        const driverCommentSpan = DOMBuilder.createElement('span');
        DOMBuilder.addClass(driverCommentSpan, 'text-sm font-extrabold text-red-600 bg-red-50 px-3 py-1 rounded-md border border-red-100');
        let commentText = 'Без коментаря';
        if (orderObj.driver_comment) {
            commentText = orderObj.driver_comment;
        }
        DOMBuilder.setText(driverCommentSpan, `Повідомлення водія: "${commentText}"`);
        DOMBuilder.appendChild(headerDiv, orderIdSpan);
        DOMBuilder.appendChild(headerDiv, driverCommentSpan);
        const actionDiv = DOMBuilder.createElement('div');
        DOMBuilder.addClass(actionDiv, 'text-xl font-black text-[#1A4B84] uppercase mt-3');
        actionDiv.innerHTML = `⚡ Рішення ШІ: ${orderObj.ai_proposed_action} <span class="text-sm text-gray-500 normal-case ml-2 font-bold bg-gray-100 px-2 py-1 rounded">➔ Нова ціль: ${FormatHelper.getWarehouseName(orderObj.ai_proposed_dest_id)}</span>`;
        const reasoningDiv = DOMBuilder.createElement('div');
        DOMBuilder.addClass(reasoningDiv, 'text-sm font-semibold text-gray-600 mt-2 mb-2 leading-relaxed');
        DOMBuilder.setText(reasoningDiv, `Обґрунтування алгоритму: ${orderObj.ai_reasoning}`);
        DOMBuilder.appendChild(contentDiv, headerDiv);
        DOMBuilder.appendChild(contentDiv, actionDiv);
        DOMBuilder.appendChild(contentDiv, reasoningDiv);
        if (orderObj.ai_proposed_delta && orderObj.ai_proposed_delta.length > 0) {
            const mathContainer = DOMBuilder.createElement('div');
            DOMBuilder.addClass(mathContainer, 'mt-4 bg-gray-50 rounded-xl p-4 border border-gray-200 text-sm font-medium w-full max-w-2xl');
            const mathHeader = DOMBuilder.createElement('div');
            DOMBuilder.addClass(mathHeader, 'text-[10px] font-black text-gray-500 uppercase mb-3 flex items-center gap-2');
            mathHeader.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"></path><path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"></path></svg>Математичний прогноз (Дельта залишків)`;
            const mathList = DOMBuilder.createElement('ul');
            DOMBuilder.addClass(mathList, 'space-y-2');
            const deltas = orderObj.ai_proposed_delta;
            for (let i = 0; i < deltas.length; i++) {
                const deltaObj = deltas[i];
                const listItem = DOMBuilder.createElement('li');
                DOMBuilder.addClass(listItem, 'flex items-center gap-3 bg-white p-2 rounded-lg border border-gray-100');
                const deltaValSpan = DOMBuilder.createElement('span');
                let deltaClass = 'text-red-600 bg-red-50';
                let sign = '';
                if (deltaObj.delta > 0) {
                    deltaClass = 'text-green-600 bg-green-50';
                    sign = '+';
                }
                DOMBuilder.addClass(deltaValSpan, `${deltaClass} px-2 py-1 rounded-md font-black min-w-[60px] text-center`);
                DOMBuilder.setText(deltaValSpan, `${sign}${deltaObj.delta}`);
                const warehouseNameSpan = DOMBuilder.createElement('span');
                DOMBuilder.addClass(warehouseNameSpan, 'text-gray-800 font-bold flex-1');
                DOMBuilder.setText(warehouseNameSpan, FormatHelper.getWarehouseName(deltaObj.warehouse_id));
                const reasonSpan = DOMBuilder.createElement('span');
                DOMBuilder.addClass(reasonSpan, 'text-gray-400 text-xs uppercase tracking-wide bg-gray-50 px-2 py-1 rounded hidden sm:block');
                DOMBuilder.setText(reasonSpan, deltaObj.reason);
                DOMBuilder.appendChild(listItem, deltaValSpan);
                DOMBuilder.appendChild(listItem, warehouseNameSpan);
                DOMBuilder.appendChild(listItem, reasonSpan);
                DOMBuilder.appendChild(mathList, listItem);
            }
            DOMBuilder.appendChild(mathContainer, mathHeader);
            DOMBuilder.appendChild(mathContainer, mathList);
            DOMBuilder.appendChild(contentDiv, mathContainer);
        }
        DOMBuilder.appendChild(flexContainer, iconDiv);
        DOMBuilder.appendChild(flexContainer, contentDiv);
        const buttonsContainer = DOMBuilder.createElement('div');
        DOMBuilder.addClass(buttonsContainer, 'flex flex-col sm:flex-row gap-3 shrink-0 w-full xl:w-auto mt-4 xl:mt-0');
        const rejectBtn = DOMBuilder.createElement('button');
        DOMBuilder.addClass(rejectBtn, 'flex-1 px-6 py-4 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-extrabold uppercase text-xs hover:bg-gray-50 transition-colors tracking-widest');
        DOMBuilder.setText(rejectBtn, 'Відхилити');
        rejectBtn.addEventListener('click', () => {
            this.executeAiDecision(orderObj.id, 'reject');
        });
        const approveBtn = DOMBuilder.createElement('button');
        DOMBuilder.addClass(approveBtn, 'flex-1 px-8 py-4 bg-green-600 text-white rounded-xl font-extrabold uppercase text-xs shadow-xl shadow-green-900/20 hover:bg-green-700 transition-colors tracking-widest');
        DOMBuilder.setText(approveBtn, 'Затвердити');
        approveBtn.addEventListener('click', () => {
            this.executeAiDecision(orderObj.id, 'approve');
        });
        DOMBuilder.appendChild(buttonsContainer, rejectBtn);
        DOMBuilder.appendChild(buttonsContainer, approveBtn);
        DOMBuilder.appendChild(cardDiv, flexContainer);
        DOMBuilder.appendChild(cardDiv, buttonsContainer);
        DOMBuilder.appendChild(containerElement, cardDiv);
    }
    async executeAiDecision(orderId, actionType) {
        const response = await this.apiService.request(`/api/dispatcher/orders/${orderId}/${actionType}_ai`, 'POST');
        if (response && response.ok) {
            let msgType = 'info';
            let msgText = 'Рішення ШІ успішно відхилено!';
            if (actionType === 'approve') {
                msgType = 'success';
                msgText = 'Рішення ШІ успішно затверджено!';
            }
            this.notificationService.show(msgText, msgType);
            this.fetchAndRenderOrders();
        } else {
            this.notificationService.show('Помилка зв\'язку з сервером при обробці рішення.', 'error');
        }
    }
    openEditOrderModal(orderId) {
        let foundOrder = null;
        const currentOrdersList = this.state.orders;
        for (let i = 0; i < currentOrdersList.length; i++) {
            if (currentOrdersList[i].id === orderId) {
                foundOrder = currentOrdersList[i];
                break;
            }
        }
        if (!foundOrder) {
            this.notificationService.show('Дані рейсу не знайдено', 'error');
            return;
        }
        this.state.selectedOrderIdForEdit = foundOrder.id;
        const subTitleElement = document.getElementById('edit-modal-subtitle');
        const orderIdInputElement = document.getElementById('edit_order_id');
        const destSelectElement = document.getElementById('edit_destination_id');
        const prioritySelectElement = document.getElementById('edit_priority');
        if (subTitleElement) {
            subTitleElement.textContent = `ID Рейсу: #${foundOrder.id} | Зарезервовано на: ${FormatHelper.getWarehouseName(foundOrder.destination_id)}`;
        }
        if (orderIdInputElement) {
            orderIdInputElement.value = foundOrder.id.toString();
        }
        if (destSelectElement) {
            destSelectElement.innerHTML = '';
            const defaultDestOption = DOMBuilder.createElement('option');
            DOMBuilder.setAttribute(defaultDestOption, 'value', '');
            DOMBuilder.setAttribute(defaultDestOption, 'disabled', 'true');
            DOMBuilder.setText(defaultDestOption, 'Виберіть новий пункт призначення...');
            DOMBuilder.appendChild(destSelectElement, defaultDestOption);
            const whList = AppConfig.WAREHOUSES;
            for (let i = 0; i < whList.length; i++) {
                const whObj = whList[i];
                const opt = DOMBuilder.createElement('option');
                DOMBuilder.setAttribute(opt, 'value', whObj.id.toString());
                DOMBuilder.setText(opt, whObj.name);
                if (whObj.id === foundOrder.origin_id) {
                    DOMBuilder.setAttribute(opt, 'disabled', 'true');
                }
                if (whObj.id === foundOrder.destination_id) {
                    DOMBuilder.setAttribute(opt, 'selected', 'true');
                }
                DOMBuilder.appendChild(destSelectElement, opt);
            }
        }
        if (prioritySelectElement) {
            prioritySelectElement.value = foundOrder.priority;
        }
        this.modalService.open('edit-modal');
    }
    async submitEditOrder(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const formObject = {};
        for (const [key, value] of formData.entries()) {
            formObject[key] = value;
        }
        const orderIdValue = formObject.edit_order_id;
        const requestBody = {};
        requestBody.new_destination_id = parseInt(formObject.new_destination_id, 10);
        requestBody.new_priority = formObject.new_priority;
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Оновлення...';
        submitBtn.disabled = true;
        try {
            const response = await this.apiService.request(`/api/dispatcher/orders/${orderIdValue}`, 'PUT', requestBody);
            if (response && response.ok) {
                this.notificationService.show('Параметри рейсу успішно оновлено!', 'success');
                this.modalService.close('edit-modal');
                this.fetchAndRenderOrders();
            } else {
                this.notificationService.show('Не вдалося оновити рейс. Сервер відхилив запит.', 'error');
            }
        } catch (error) {
            this.notificationService.show('Помилка при відправці запиту оновлення.', 'error');
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }
    handleTriggerDeleteConfirm() {
        if (!this.state.selectedOrderIdForEdit) {
            return;
        }
        this.modalService.close('edit-modal');
        this.modalService.open('delete-confirm-modal');
    }
    async executeDeleteOrder() {
        const targetId = this.state.selectedOrderIdForEdit;
        if (!targetId) {
            return;
        }
        const confirmBtn = document.getElementById('btn-confirm-delete');
        if (confirmBtn) {
            confirmBtn.textContent = 'Видалення...';
            confirmBtn.disabled = true;
        }
        try {
            const response = await this.apiService.request(`/api/dispatcher/orders/${targetId}`, 'DELETE');
            if (response && response.ok) {
                this.notificationService.show(`Рейс #${targetId} повністю скасовано та видалено.`, 'success');
            } else {
                this.notificationService.show(`API видалення недоступне, але операцію відмінено локально.`, 'warning');
            }
            const newOrdersList = [];
            for (let i = 0; i < this.state.orders.length; i++) {
                if (this.state.orders[i].id !== targetId) {
                    newOrdersList.push(this.state.orders[i]);
                }
            }
            this.state.orders = newOrdersList;
            this.renderOrdersTable(this.state.orders);
        } catch (error) {
            this.notificationService.show('Виникла помилка під час видалення', 'error');
        } finally {
            if (confirmBtn) {
                confirmBtn.textContent = 'Так, видалити';
                confirmBtn.disabled = false;
            }
            this.modalService.close('delete-confirm-modal');
            this.state.selectedOrderIdForEdit = null;
        }
    }
    async handleInventoryRefresh(buttonElement) {
        if (!buttonElement) {
            return;
        }
        const svgIcon = buttonElement.querySelector('.refresh-icon');
        if (svgIcon) {
            svgIcon.classList.add('animate-spin-once');
            setTimeout(() => {
                svgIcon.classList.remove('animate-spin-once');
            }, 1000);
        }
        await this.fetchAndRenderInventory();
        this.notificationService.show('Дані зі складів успішно синхронізовано', 'info', 2000);
    }
    async handleDriverRefresh(buttonElement) {
        if (!buttonElement) {
            return;
        }
        const svgIcon = buttonElement.querySelector('#refresh-icon-driver');
        if (svgIcon) {
            svgIcon.classList.add('animate-spin-once');
            setTimeout(() => {
                svgIcon.classList.remove('animate-spin-once');
            }, 1000);
        }
        await this.fetchAndRenderDriverScreen();
    }
    async fetchAndRenderInventory() {
        const response = await this.apiService.request('/api/dispatcher/inventory', 'GET');
        if (!response || !response.ok) {
            return;
        }
        try {
            const inventoryData = await response.json();
            this.state.inventory = inventoryData;
            this.renderInventoryTable(inventoryData);
        } catch (error) {
            this.notificationService.show('Помилка обробки даних інвентарю.', 'error');
        }
    }
    renderInventoryTable(inventoryList) {
        const tableBody = document.getElementById('inventory-table-body');
        if (!tableBody) {
            return;
        }
        tableBody.innerHTML = '';
        if (!inventoryList || inventoryList.length === 0) {
            const emptyRow = DOMBuilder.createElement('tr');
            const emptyCell = DOMBuilder.createElement('td');
            DOMBuilder.setAttribute(emptyCell, 'colspan', '3');
            DOMBuilder.addClass(emptyCell, 'p-10 text-center text-gray-400 font-extrabold uppercase tracking-widest text-sm');
            DOMBuilder.setText(emptyCell, 'Інвентар порожній або дані відсутні');
            DOMBuilder.appendChild(emptyRow, emptyCell);
            DOMBuilder.appendChild(tableBody, emptyRow);
            return;
        }
        const sortedList = inventoryList.slice();
        sortedList.sort((a, b) => {
            return a.warehouse_id - b.warehouse_id;
        });
        for (let i = 0; i < sortedList.length; i++) {
            const itemObj = sortedList[i];
            const tr = DOMBuilder.createElement('tr');
            DOMBuilder.addClass(tr, 'hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0');
            const badgeData = FormatHelper.getCargoBadgeInfo(itemObj.item_type);
            const tdLocation = DOMBuilder.createElement('td');
            DOMBuilder.addClass(tdLocation, 'p-6');
            const whNameDiv = DOMBuilder.createElement('div');
            DOMBuilder.addClass(whNameDiv, 'font-extrabold text-gray-900 text-base');
            DOMBuilder.setText(whNameDiv, FormatHelper.getWarehouseName(itemObj.warehouse_id));
            const whDescDiv = DOMBuilder.createElement('div');
            DOMBuilder.addClass(whDescDiv, 'text-[11px] text-gray-500 font-semibold mt-1 bg-gray-100 inline-block px-2 py-0.5 rounded');
            DOMBuilder.setText(whDescDiv, FormatHelper.getWarehouseLocation(itemObj.warehouse_id));
            DOMBuilder.appendChild(tdLocation, whNameDiv);
            DOMBuilder.appendChild(tdLocation, whDescDiv);
            DOMBuilder.appendChild(tr, tdLocation);
            const tdType = DOMBuilder.createElement('td');
            DOMBuilder.addClass(tdType, 'p-6');
            const spanType = DOMBuilder.createElement('span');
            DOMBuilder.addClass(spanType, `px-4 py-2 rounded-lg text-xs font-black uppercase border ${badgeData.bg}`);
            DOMBuilder.setText(spanType, badgeData.icon);
            DOMBuilder.appendChild(tdType, spanType);
            DOMBuilder.appendChild(tr, tdType);
            const tdQty = DOMBuilder.createElement('td');
            DOMBuilder.addClass(tdQty, 'p-6 text-right');
            const qtyDiv = DOMBuilder.createElement('div');
            DOMBuilder.addClass(qtyDiv, 'text-2xl font-black text-gray-900');
            DOMBuilder.setText(qtyDiv, itemObj.quantity.toString());
            const unitDiv = DOMBuilder.createElement('div');
            DOMBuilder.addClass(unitDiv, 'text-[10px] text-gray-400 font-black uppercase mt-1 tracking-widest');
            DOMBuilder.setText(unitDiv, 'Одиниць');
            DOMBuilder.appendChild(tdQty, qtyDiv);
            DOMBuilder.appendChild(tdQty, unitDiv);
            DOMBuilder.appendChild(tr, tdQty);
            DOMBuilder.appendChild(tableBody, tr);
        }
    }
    initializeDriver() {
        this.fetchAndRenderDriverScreen();
        const driverPollingTimer = setInterval(() => {
            this.fetchAndRenderDriverScreen();
        }, 10000);
        this.intervals.push(driverPollingTimer);
    }

    async fetchAndRenderDriverScreen() {
        const contentContainer = document.getElementById('driver-view-content');
        if (!contentContainer) {
            return;
        }
        const response = await this.apiService.request('/api/driver/orders/current', 'GET');
        if (!response || !response.ok) {
            
            const emptyStateHtml = [
                '<div class="w-full bg-white rounded-[32px] p-8 md:p-12 shadow-xl border border-gray-100 flex flex-col items-center justify-center min-h-[50vh]">',
                '    <div class="bg-gray-50 w-32 h-32 rounded-full flex items-center justify-center mb-6">',
                '        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">',
                '            <path d="M10 17h4V5H2v12h3m14 0h2v-5l-4-5h-3v10h1m-10 0a2 2 0 1 0 4 0a2 2 0 1 0-4 0m10 0a2 2 0 1 0 4 0a2 2 0 1 0-4 0"></path>',
                '        </svg>',
                '    </div>',
                '    <h3 class="text-2xl font-black text-gray-400 uppercase tracking-wide">Активних рейсів немає</h3>',
                '    <p class="text-base font-bold text-gray-500 mt-2 max-w-sm text-center">Відпочивайте та очікуйте нових вказівок або призначення рейсу від диспетчера.</p>',
                '</div>'
            ].join('');
            contentContainer.innerHTML = emptyStateHtml;
            return;
        }
        try {
            const responseData = await response.json();
            
            let currentOrder = null;
            if (Array.isArray(responseData)) {
                if (responseData.length > 0) {
                    currentOrder = responseData[0];
                }
            } else if (responseData && responseData.id) {
                currentOrder = responseData;
            }
            
            if (!currentOrder || !currentOrder.id) {
                const emptyStateHtml = [
                    '<div class="w-full bg-white rounded-[32px] p-8 md:p-12 shadow-xl border border-gray-100 flex flex-col items-center justify-center min-h-[50vh]">',
                    '    <div class="bg-gray-50 w-32 h-32 rounded-full flex items-center justify-center mb-6">',
                    '        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">',
                    '            <path d="M10 17h4V5H2v12h3m14 0h2v-5l-4-5h-3v10h1m-10 0a2 2 0 1 0 4 0a2 2 0 1 0-4 0m10 0a2 2 0 1 0 4 0a2 2 0 1 0-4 0"></path>',
                    '        </svg>',
                    '    </div>',
                    '    <h3 class="text-2xl font-black text-gray-400 uppercase tracking-wide">Активних рейсів немає</h3>',
                    '    <p class="text-base font-bold text-gray-500 mt-2 max-w-sm text-center">Відпочивайте та очікуйте нових вказівок або призначення рейсу від диспетчера.</p>',
                    '</div>'
                ].join('');
                contentContainer.innerHTML = emptyStateHtml;
                return;
            }
            
            this.state.currentDriverOrderId = currentOrder.id;
            
            let uahStatusText = currentOrder.status;
            if (AppConfig.DICTIONARY.status[currentOrder.status]) {
                uahStatusText = AppConfig.DICTIONARY.status[currentOrder.status];
            }
            
            let statusIcon = '📦';
            if (AppConfig.DICTIONARY.icons[currentOrder.status]) {
                statusIcon = AppConfig.DICTIONARY.icons[currentOrder.status];
            }
            
            let isCriticalLevel = false;
            if (currentOrder.priority === 'CRITICAL') {
                isCriticalLevel = true;
            }
            
            let cardBorderClass = 'border-[#1A4B84]';
            if (isCriticalLevel) {
                cardBorderClass = 'border-red-500 shadow-red-100';
            }
            
            let statusBadgeClass = 'bg-gray-50 text-gray-700 border-gray-200';
            if (currentOrder.status === 'NEEDS_ATTENTION') {
                statusBadgeClass = 'bg-orange-100 text-orange-700 border-orange-200';
            }
            
            let actionButtonsHtml = '';
            if (currentOrder.status === 'PENDING') {
                actionButtonsHtml += [
                    '<button id="btn-driver-accept" class="w-full h-20 bg-[#2E7D32] text-white rounded-[20px] font-extrabold text-xl shadow-2xl shadow-green-900/30 hover:bg-green-800 transition-transform active:scale-95 uppercase tracking-wider border-b-4 border-green-900">',
                    '    ✅ РОЗПОЧАТИ РУХ',
                    '</button>'
                ].join('');
            }
            
            if (currentOrder.status === 'IN_PROGRESS' || currentOrder.status === 'NEEDS_ATTENTION' || currentOrder.status === 'REROUTED') {
                actionButtonsHtml += [
                    '<div class="flex flex-col sm:flex-row gap-4 w-full">',
                    '    <button id="btn-driver-complete" class="flex-[1.5] h-16 md:h-20 bg-[#1A4B84] text-white rounded-[20px] font-extrabold text-lg md:text-xl shadow-2xl shadow-blue-900/30 hover:bg-[#12365e] transition-transform active:scale-95 uppercase tracking-wider border-b-4 border-blue-900">',
                    '        🏁 ФІНІШ РЕЙСУ',
                    '    </button>',
                    '    <button id="btn-open-sos" class="flex-1 h-16 md:h-20 font-black text-red-600 uppercase tracking-widest border-4 border-red-100 rounded-[20px] hover:bg-red-50 hover:border-red-200 transition-colors active:bg-red-100 flex justify-center items-center gap-2">',
                    '        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">',
                    '            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01"></path>',
                    '        </svg>',
                    '        ФОРС-МАЖОР',
                    '    </button>',
                    '</div>'
                ].join('');
            }
            
            let aiReasoningHtml = '';
            if (currentOrder.ai_reasoning) {
                let aiActionText = currentOrder.ai_reasoning;
                if (currentOrder.ai_proposed_action) {
                    aiActionText = currentOrder.ai_proposed_action;
                }
                aiReasoningHtml = [
                    '<div class="bg-blue-50/50 p-6 rounded-[20px] border-l-4 border-[#1A4B84] animate__animated animate__pulse mt-6">',
                    '    <div class="text-[11px] font-black text-[#1A4B84] uppercase tracking-widest mb-3 flex items-center gap-2">',
                    '        <span class="text-xl">🤖</span> Системна вказівка (ШІ-Аналіз)',
                    '    </div>',
                    '    <p class="text-sm font-bold text-gray-800 leading-relaxed italic">',
                    `        "${aiActionText}"`,
                    '    </p>',
                    '</div>'
                ].join('');
            }
            
            const cardHtml = [
                `<div class="w-full bg-white rounded-[32px] p-8 md:p-12 shadow-xl border border-gray-100 border-t-8 ${cardBorderClass}">`,
                '    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 pb-6 border-b border-gray-100 gap-4">',
                `        <span class="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest border-2 ${statusBadgeClass}">`,
                `            ${statusIcon} ${uahStatusText}`,
                '        </span>',
                `        <span class="text-gray-400 font-extrabold text-sm bg-gray-50 border border-gray-200 px-4 py-2 rounded-xl">Квиток #${currentOrder.id}</span>`,
                '    </div>',
                '    <div class="text-[11px] font-black text-gray-400 uppercase mb-3 tracking-widest">Маршрут Прямування:</div>',
                '    <div class="text-2xl md:text-4xl font-black text-gray-900 mb-10 leading-tight">',
                `        <span class="text-gray-500 block mb-3 text-xl md:text-3xl">${FormatHelper.getWarehouseName(currentOrder.origin_id)}</span>`,
                '        <span class="text-[#1A4B84] flex items-center gap-3">',
                '            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" class="text-blue-300">',
                '                <path d="M5 12h14M12 5l7 7-7 7"></path>',
                '            </svg>',
                `            ${FormatHelper.getWarehouseName(currentOrder.destination_id)}`,
                '        </span>',
                '    </div>',
                '    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">',
                '        <div class="bg-gray-50 p-6 rounded-[20px] border-2 border-gray-100">',
                '            <p class="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2">Вантаж</p>',
                `            <p class="text-xl md:text-2xl font-black text-gray-900">${currentOrder.cargo_type}</p>`,
                '        </div>',
                '        <div class="bg-gray-50 p-6 rounded-[20px] border-2 border-gray-100">',
                '            <p class="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2">Об\'єм / К-сть</p>',
                `            <p class="text-xl md:text-2xl font-black text-gray-900">${currentOrder.cargo_quantity} <span class="text-sm text-gray-500 font-bold">од.</span></p>`,
                '        </div>',
                '    </div>',
                `    ${aiReasoningHtml}`,
                '</div>',
                '<div class="space-y-4 w-full mt-6">',
                `    ${actionButtonsHtml}`,
                '</div>'
            ].join('');
            
            contentContainer.innerHTML = cardHtml;
            
            const sosBtn = document.getElementById('btn-open-sos');
            if (sosBtn) {
                sosBtn.onclick = () => {
                    this.openSosModal(); 
                };
            }

            const acceptBtn = document.getElementById('btn-driver-accept');
            if (acceptBtn) {
                acceptBtn.onclick = () => this.updateDriverStatus('accept');
            }

            const completeBtn = document.getElementById('btn-driver-complete'); 
            if (completeBtn) {
                completeBtn.onclick = () => this.updateDriverStatus('complete');
            }
            
            //this.eventBinder.bindCustomActions();
        } catch (error) {
            this.notificationService.show('Помилка обробки поточного рейсу', 'error');
        }
    }

    openSosModal() {
        const currentDriverId = this.state.currentDriverOrderId;
        if (!currentDriverId) {
            return;
        }
        this.modalService.open('sos-modal');
        const sosCommentTextarea = document.getElementById('sos-comment');
        if (sosCommentTextarea) {
            sosCommentTextarea.value = '';
            setTimeout(() => {
                sosCommentTextarea.focus();
            }, 150);
        }
    }
    closeSosModal() {
        this.modalService.close('sos-modal');
    }
    async submitSosForm(e) {
        e.preventDefault();
        const currentDriverId = this.state.currentDriverOrderId;
        if (!currentDriverId) {
            return;
        }
        const formData = new FormData(e.target);
        let commentText = formData.get('driver_comment');
        if (!commentText || commentText.trim() === '') {
            this.notificationService.show('Будь ласка, коротко опишіть суть проблеми', 'warning');
            return;
        }
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const oldText = submitBtn.textContent;
        submitBtn.textContent = 'Надсилання...';
        submitBtn.disabled = true;
        try {
            const reqBody = { driver_comment: commentText.trim() };
            const response = await this.apiService.request(`/api/driver/orders/${currentDriverId}/force_majeure`, 'POST', reqBody);
            if (response && response.ok) {
                this.closeSosModal();
                this.fetchAndRenderDriverScreen();
                this.notificationService.show('Сигнал надіслано! Штучний інтелект аналізує шляхи обходу...', 'info', 5000);
            } else {
                this.notificationService.show('Не вдалося надіслати звіт. Спробуйте пізніше.', 'error');
            }
        } catch (error) {
            this.notificationService.show('Мережева помилка.', 'error');
        } finally {
            submitBtn.textContent = oldText;
            submitBtn.disabled = false;
        }
    }
    async updateDriverStatus(actionStr) {
        const currentDriverId = this.state.currentDriverOrderId;
        if (!currentDriverId) {
            return;
        }
        try {
            const response = await this.apiService.request(`/api/driver/orders/${currentDriverId}/${actionStr}`, 'POST');
            if (response && response.ok) {
                this.fetchAndRenderDriverScreen();
                let successMsg = 'Рейс розпочато! Бережіть себе в дорозі.';
                if (actionStr === 'complete') {
                    successMsg = 'Товар розвантажено, місія завершена!';
                }
                this.notificationService.show(successMsg, 'success');
            } else {
                this.notificationService.show('Не вдалося оновити статус рейсу', 'error');
            }
        } catch (error) {
            this.notificationService.show('Мережева помилка при оновленні статусу', 'error');
        }
    }
    async handleLoginSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const formObject = {};
        for (const [key, value] of formData.entries()) {
            formObject[key] = value;
        }
        const urlParams = new URLSearchParams();
        urlParams.append('username', formObject.username);
        urlParams.append('password', formObject.password);
        const submitBtn = e.target.querySelector('button[type="submit"]');
        let originalText = '';
        if (submitBtn) {
            originalText = submitBtn.textContent;
            submitBtn.textContent = 'Зачекайте...';
            submitBtn.disabled = true;
        }
        try {
            const configObj = {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: urlParams
            };
            const response = await fetch('/api/auth/login', configObj);
            if (response.ok) {
                const responseData = await response.json();
                localStorage.setItem('access_token', responseData.access_token);
                localStorage.setItem('refresh_token', responseData.refresh_token);
                this.notificationService.show('Успішна авторизація. Завантаження...', 'success');
                setTimeout(() => {
                    const enteredUsername = formObject.username;
                    if (enteredUsername.indexOf('dispatcher') !== -1) {
                        window.location.href = '/dispatcher';
                    } else {
                        window.location.href = '/driver';
                    }
                }, 600);
            } else {
                alert('Невірний логін або пароль. Спробуйте ще раз.');
                if (submitBtn) {
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                }
            }
        } catch (err) {
            alert('Сервер недоступний. Перевірте з\'єднання або роботу БД.');
            if (submitBtn) {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        }
    }
}

class SystemPerformanceMonitor {
    static check() {
        return Date.now();
    }
    static logPulse() {
        if (window.DEBUG_MODE) {
            console.log('System pulse checked at: ' + new Date().toISOString());
        }
    }
}

class ApplicationBootstrapper {
    static run() {
        SystemPerformanceMonitor.logPulse();
        const startupDelay = Math.random() * 100;
        setTimeout(() => {
            if (window.DEBUG_MODE) {
                console.log('App ready after ' + startupDelay + 'ms');
            }
        }, startupDelay);
    }
}

class DataValidationUtility {
    static isObject(item) {
        return (item && typeof item === 'object' && !Array.isArray(item));
    }
    static deepClone(obj) {
        if (!this.isObject(obj)) return obj;
        let clone = {};
        for (let key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                clone[key] = this.deepClone(obj[key]);
            }
        }
        return clone;
    }
}

class CacheManager {
    static setItem(key, value, ttl = 3600000) {
        const item = {
            value: value,
            expiry: Date.now() + ttl,
        };
        localStorage.setItem(key, JSON.stringify(item));
    }
    static getItem(key) {
        const itemStr = localStorage.getItem(key);
        if (!itemStr) return null;
        const item = JSON.parse(itemStr);
        if (Date.now() > item.expiry) {
            localStorage.removeItem(key);
            return null;
        }
        return item.value;
    }
}

class UIStatePreserver {
    constructor() {
        this.states = new Map();
    }
    saveState(id, state) {
        this.states.set(id, state);
    }
    loadState(id) {
        return this.states.get(id);
    }
}

const UI_STATE = new UIStatePreserver();
UI_STATE.saveState('init', { time: Date.now(), loaded: true });

class ErrorBoundaryLogger {
    static capture(error, context) {
        const errorRecord = {
            message: error.message || 'Unknown Error',
            stack: error.stack || '',
            context: context || 'global',
            timestamp: new Date().toISOString()
        };
        let existingLogs = CacheManager.getItem('error_logs') || [];
        existingLogs.push(errorRecord);
        CacheManager.setItem('error_logs', existingLogs, 86400000); // 24 hours
        console.error('Captured by Boundary:', errorRecord);
    }
}

window.addEventListener('error', function(event) {
    ErrorBoundaryLogger.capture(event.error, 'Window Error Listener');
});

window.appController = new CoreController();
document.addEventListener('DOMContentLoaded', () => {
    ApplicationBootstrapper.run();
    window.appController.initialize();
});
window.handleLogin = function(event) {
    if (window.appController) {
        window.appController.handleLoginSubmit(event);
    }
};

class PostInitWorker {
    static execute() {
        const dummyWorkload = [];
        for(let i = 0; i < 50; i++) {
            dummyWorkload.push(Math.pow(i, 2));
        }
        return dummyWorkload.length === 50;
    }
}

PostInitWorker.execute();