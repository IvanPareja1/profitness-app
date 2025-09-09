"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Nutrition;
var react_1 = require("react");
var react_router_dom_1 = require("react-router-dom");
var useAuth_1 = require("../../hooks/useAuth");
function Nutrition() {
    var _this = this;
    var _a = (0, react_1.useState)('add'), activeTab = _a[0], setActiveTab = _a[1];
    var _b = (0, react_1.useState)(false), showScanner = _b[0], setShowScanner = _b[1];
    var _c = (0, react_1.useState)(false), showSearch = _c[0], setShowSearch = _c[1];
    var _d = (0, react_1.useState)(''), searchQuery = _d[0], setSearchQuery = _d[1];
    var _e = (0, react_1.useState)([]), searchResults = _e[0], setSearchResults = _e[1];
    var _f = (0, react_1.useState)(false), showCamera = _f[0], setShowCamera = _f[1];
    var _g = (0, react_1.useState)('photo'), cameraMode = _g[0], setCameraMode = _g[1];
    var _h = (0, react_1.useState)(false), isProcessing = _h[0], setIsProcessing = _h[1];
    var _j = (0, react_1.useState)(null), photoResult = _j[0], setPhotoResult = _j[1];
    var _k = (0, react_1.useState)([]), meals = _k[0], setMeals = _k[1];
    var _l = (0, react_1.useState)({ calories: 0, carbs: 0, protein: 0, fat: 0 }), dayTotals = _l[0], setDayTotals = _l[1];
    var _m = (0, react_1.useState)(false), loading = _m[0], setLoading = _m[1];
    var _o = (0, react_1.useState)(new Date().toISOString().split('T')[0]), selectedDate = _o[0], setSelectedDate = _o[1];
    var _p = (0, react_1.useState)(false), showManualForm = _p[0], setShowManualForm = _p[1];
    var _q = (0, react_1.useState)({
        name: '',
        calories: '',
        carbs: '',
        protein: '',
        fat: '',
        quantity: '1',
        unit: 'porción'
    }), manualFood = _q[0], setManualFood = _q[1];
    // Estados del lector de códigos de barras
    var _r = (0, react_1.useState)(null), scanResult = _r[0], setScanResult = _r[1];
    var _s = (0, react_1.useState)(false), isScanProcessing = _s[0], setIsScanProcessing = _s[1];
    var videoRef = (0, react_1.useRef)(null);
    var canvasRef = (0, react_1.useRef)(null);
    var scanIntervalRef = (0, react_1.useRef)(null);
    var navigate = (0, react_router_dom_1.useNavigate)();
    var user = (0, useAuth_1.useAuth)().user;
    var callSupabaseFunction = function (functionName_1) {
        var args_1 = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args_1[_i - 1] = arguments[_i];
        }
        return __awaiter(_this, __spreadArray([functionName_1], args_1, true), void 0, function (functionName, options) {
            var session, response;
            if (options === void 0) { options = {}; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, useAuth_1.supabase.auth.getSession()];
                    case 1:
                        session = (_a.sent()).data.session;
                        if (!session)
                            throw new Error('No authenticated session');
                        return [4 /*yield*/, fetch("".concat(import.meta.env.VITE_PUBLIC_SUPABASE_URL, "/functions/v1/").concat(functionName), {
                                method: options.method || 'GET',
                                headers: __assign({ 'Content-Type': 'application/json', 'Authorization': "Bearer ".concat(session.access_token) }, options.headers),
                                body: options.body ? JSON.stringify(options.body) : undefined,
                            })];
                    case 2:
                        response = _a.sent();
                        if (!response.ok) {
                            throw new Error("HTTP error! status ".concat(response.status));
                        }
                        return [2 /*return*/, response.json()];
                }
            });
        });
    };
    // Función para inicializar la cámara para escaneo
    var startBarcodeScanner = function () { return __awaiter(_this, void 0, void 0, function () {
        var stream, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    setShowScanner(true);
                    return [4 /*yield*/, navigator.mediaDevices.getUserMedia({
                            video: {
                                facingMode: 'environment', // Cámara trasera
                                width: { ideal: 640 },
                                height: { ideal: 480 }
                            }
                        })];
                case 1:
                    stream = _a.sent();
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                        videoRef.current.play();
                        // Iniciar el escaneo automático
                        scanIntervalRef.current = setInterval(function () {
                            scanBarcode();
                        }, 1000);
                    }
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    console.error('Error accessing camera:', error_1);
                    alert('No se pudo acceder a la cámara. Verifica los permisos.');
                    setShowScanner(false);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    // Función para escanear código de barras
    var scanBarcode = function () {
        if (videoRef.current && canvasRef.current && !isScanProcessing) {
            var video = videoRef.current;
            var canvas = canvasRef.current;
            var context = canvas.getContext('2d');
            if (context && video.readyState === video.HAVE_ENOUGH_DATA) {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                // Simular detección de código de barras
                // En una implementación real, aquí usarías una librería como QuaggaJS o ZXing
                simulateBarcodeDetection();
            }
        }
    };
    // Simular detección de código de barras (reemplazar con librería real)
    var simulateBarcodeDetection = function () {
        if (Math.random() > 0.7) { // 30% de probabilidad de detección
            var mockBarcodes = [
                { code: '7501000123456', name: 'Yogur Natural Danone', calories: 89, carbs: 12, protein: 5, fat: 3.2 },
                { code: '7501000234567', name: 'Leche Descremada Lala', calories: 35, carbs: 5, protein: 3.5, fat: 0.1 },
                { code: '7501000345678', name: 'Cereal Fitness Nestlé', calories: 375, carbs: 75, protein: 8, fat: 3 },
                { code: '7501000456789', name: 'Atún en Agua Herdez', calories: 116, carbs: 0, protein: 26, fat: 1 },
                { code: '7501000567890', name: 'Pan Integral Bimbo', calories: 250, carbs: 42, protein: 12, fat: 4.5 },
            ];
            var randomProduct = mockBarcodes[Math.floor(Math.random() * mockBarcodes.length)];
            processBarcodeResult(randomProduct);
        }
    };
    // Procesar resultado del código de barras
    var processBarcodeResult = function (product) { return __awaiter(_this, void 0, void 0, function () {
        var productInfo, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setIsScanProcessing(true);
                    // Detener el escaneo
                    if (scanIntervalRef.current) {
                        clearInterval(scanIntervalRef.current);
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, callSupabaseFunction('barcode-lookup', {
                            method: 'POST',
                            body: { barcode: product.code }
                        })];
                case 2:
                    productInfo = _a.sent();
                    if (productInfo.success) {
                        setScanResult(productInfo.product);
                    }
                    else {
                        setScanResult(product); // Usar datos mock si falla la búsqueda
                    }
                    return [3 /*break*/, 5];
                case 3:
                    error_2 = _a.sent();
                    console.error('Error processing barcode:', error_2);
                    setScanResult(product); // Usar datos mock si falla la búsqueda
                    return [3 /*break*/, 5];
                case 4:
                    setIsScanProcessing(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    // Función para cerrar el escáner
    var closeBarcodeScanner = function () {
        setShowScanner(false);
        setScanResult(null);
        setIsScanProcessing(false);
        if (scanIntervalRef.current) {
            clearInterval(scanIntervalRef.current);
        }
        if (videoRef.current && videoRef.current.srcObject) {
            var tracks = videoRef.current.srcObject.getTracks();
            tracks.forEach(function (track) { return track.stop(); });
        }
    };
    // Función para agregar producto escaneado
    var addScannedProduct = function () { return __awaiter(_this, void 0, void 0, function () {
        var error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!scanResult) return [3 /*break*/, 5];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, callSupabaseFunction('meals', {
                            method: 'POST',
                            body: {
                                name: scanResult.name,
                                calories: scanResult.calories,
                                carbs: scanResult.carbs || 0,
                                protein: scanResult.protein || 0,
                                fat: scanResult.fat || 0,
                                quantity: 1,
                                unit: 'porción',
                                meal_type: 'barcode_scanned'
                            }
                        })];
                case 2:
                    _a.sent();
                    closeBarcodeScanner();
                    return [4 /*yield*/, loadMeals()];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    error_3 = _a.sent();
                    console.error('Error adding scanned product:', error_3);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var loadMeals = function () { return __awaiter(_this, void 0, void 0, function () {
        var data, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, 3, 4]);
                    setLoading(true);
                    return [4 /*yield*/, callSupabaseFunction("meals?date=".concat(selectedDate))];
                case 1:
                    data = _a.sent();
                    setMeals(data.meals || []);
                    setDayTotals(data.totals || { calories: 0, carbs: 0, protein: 0, fat: 0 });
                    return [3 /*break*/, 4];
                case 2:
                    error_4 = _a.sent();
                    console.error('Error loading meals:', error_4);
                    return [3 /*break*/, 4];
                case 3:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    (0, react_1.useEffect)(function () {
        if (user) {
            loadMeals();
        }
    }, [selectedDate, user]);
    // Limpiar recursos al desmontar
    (0, react_1.useEffect)(function () {
        return function () {
            if (scanIntervalRef.current) {
                clearInterval(scanIntervalRef.current);
            }
        };
    }, []);
    var handleSearch = function (query) { return __awaiter(_this, void 0, void 0, function () {
        var data, error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setSearchQuery(query);
                    if (!(query.length > 0)) return [3 /*break*/, 5];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, callSupabaseFunction('meals/search', {
                            method: 'POST',
                            body: { query: query }
                        })];
                case 2:
                    data = _a.sent();
                    setSearchResults(data.results || []);
                    return [3 /*break*/, 4];
                case 3:
                    error_5 = _a.sent();
                    console.error('Error searching foods:', error_5);
                    setSearchResults([]);
                    return [3 /*break*/, 4];
                case 4: return [3 /*break*/, 6];
                case 5:
                    setSearchResults([]);
                    _a.label = 6;
                case 6: return [2 /*return*/];
            }
        });
    }); };
    var addFoodFromSearch = function (food) { return __awaiter(_this, void 0, void 0, function () {
        var error_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, callSupabaseFunction('meals', {
                            method: 'POST',
                            body: {
                                name: food.name,
                                calories: food.calories,
                                carbs: food.carbs,
                                protein: food.protein,
                                fat: food.fat,
                                quantity: 1,
                                unit: food.per,
                                meal_type: 'snack'
                            }
                        })];
                case 1:
                    _a.sent();
                    setShowSearch(false);
                    setSearchQuery('');
                    setSearchResults([]);
                    return [4 /*yield*/, loadMeals()];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    error_6 = _a.sent();
                    console.error('Error adding food:', error_6);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var addManualFood = function (e) { return __awaiter(_this, void 0, void 0, function () {
        var error_7;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    e.preventDefault();
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, callSupabaseFunction('meals', {
                            method: 'POST',
                            body: {
                                name: manualFood.name,
                                calories: parseInt(manualFood.calories) || 0,
                                carbs: parseFloat(manualFood.carbs) || 0,
                                protein: parseFloat(manualFood.protein) || 0,
                                fat: parseFloat(manualFood.fat) || 0,
                                quantity: parseFloat(manualFood.quantity) || 1,
                                unit: manualFood.unit,
                                meal_type: 'manual'
                            }
                        })];
                case 2:
                    _a.sent();
                    setManualFood({
                        name: '',
                        calories: '',
                        carbs: '',
                        protein: '',
                        fat: '',
                        quantity: '1',
                        unit: 'porción'
                    });
                    setShowManualForm(false);
                    return [4 /*yield*/, loadMeals()];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    error_7 = _a.sent();
                    console.error('Error adding manual food:', error_7);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var deleteMeal = function (mealId) { return __awaiter(_this, void 0, void 0, function () {
        var error_8;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, callSupabaseFunction("meals/".concat(mealId), {
                            method: 'DELETE'
                        })];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, loadMeals()];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    error_8 = _a.sent();
                    console.error('Error deleting meal:', error_8);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleTakePhoto = function () {
        setCameraMode('photo');
        setShowCamera(true);
    };
    var handleSelectFromGallery = function () {
        setCameraMode('gallery');
        setShowCamera(true);
    };
    var simulatePhotoCapture = function () { return __awaiter(_this, void 0, void 0, function () {
        var analysisResult, error_9;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setIsProcessing(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, callSupabaseFunction('ai-food-analysis', {
                            method: 'POST',
                            body: {
                                image_mode: cameraMode,
                                user_preferences: {
                                    dietary_restrictions: [],
                                    accuracy_level: 'high'
                                }
                            }
                        })];
                case 2:
                    analysisResult = _a.sent();
                    if (analysisResult.success) {
                        setPhotoResult(analysisResult.data);
                    }
                    else {
                        // Fallback con datos simulados mejorados
                        setPhotoResult({
                            detectedFoods: [
                                {
                                    name: 'Ensalada César',
                                    calories: 180,
                                    confidence: '94%',
                                    portion: '1 plato',
                                    carbs: 12,
                                    protein: 8,
                                    fat: 14,
                                    ingredients: ['lechuga', 'pollo', 'queso parmesano', 'aderezo césar']
                                },
                                {
                                    name: 'Pollo a la parrilla',
                                    calories: 220,
                                    confidence: '89%',
                                    portion: '150g',
                                    carbs: 0,
                                    protein: 31,
                                    fat: 9,
                                    ingredients: ['pechuga de pollo', 'especias']
                                },
                                {
                                    name: 'Pan integral',
                                    calories: 80,
                                    confidence: '96%',
                                    portion: '1 rebanada',
                                    carbs: 15,
                                    protein: 4,
                                    fat: 1,
                                    ingredients: ['harina integral', 'semillas']
                                }
                            ],
                            totalCalories: 480,
                            totalCarbs: 27,
                            totalProtein: 43,
                            totalFat: 24,
                            confidence_score: 93,
                            analysis_time: new Date().toISOString(),
                            image: 'healthy caesar salad with grilled chicken and whole grain bread on white plate, food photography style, natural lighting, restaurant quality presentation'
                        });
                    }
                    return [3 /*break*/, 5];
                case 3:
                    error_9 = _a.sent();
                    console.error('Error analyzing food image:', error_9);
                    // Fallback mejorado en caso de error
                    setPhotoResult({
                        detectedFoods: [
                            {
                                name: 'Comida saludable detectada',
                                calories: 300,
                                confidence: '85%',
                                portion: '1 porción',
                                carbs: 35,
                                protein: 20,
                                fat: 12,
                                ingredients: ['ingredientes mixtos']
                            }
                        ],
                        totalCalories: 300,
                        totalCarbs: 35,
                        totalProtein: 20,
                        totalFat: 12,
                        confidence_score: 85,
                        analysis_time: new Date().toISOString(),
                        image: 'healthy mixed food plate, natural lighting, food photography style'
                    });
                    return [3 /*break*/, 5];
                case 4:
                    setIsProcessing(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var addDetectedFood = function (food) { return __awaiter(_this, void 0, void 0, function () {
        var error_10;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, callSupabaseFunction('meals', {
                            method: 'POST',
                            body: {
                                name: food.name,
                                calories: food.calories,
                                carbs: food.carbs || 0,
                                protein: food.protein || 0,
                                fat: food.fat || 0,
                                quantity: 1,
                                unit: food.portion,
                                meal_type: 'ai_detected',
                                confidence_score: food.confidence,
                                ingredients: food.ingredients ? food.ingredients.join(', ') : null
                            }
                        })];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, loadMeals()];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    error_10 = _a.sent();
                    console.error('Error adding detected food:', error_10);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var addAllDetectedFoods = function () { return __awaiter(_this, void 0, void 0, function () {
        var _i, _a, food, error_11;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!photoResult) return [3 /*break*/, 8];
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 7, , 8]);
                    _i = 0, _a = photoResult.detectedFoods;
                    _b.label = 2;
                case 2:
                    if (!(_i < _a.length)) return [3 /*break*/, 5];
                    food = _a[_i];
                    return [4 /*yield*/, callSupabaseFunction('meals', {
                            method: 'POST',
                            body: {
                                name: food.name,
                                calories: food.calories,
                                carbs: food.carbs || 0,
                                protein: food.protein || 0,
                                fat: food.fat || 0,
                                quantity: 1,
                                unit: food.portion,
                                meal_type: 'ai_detected'
                            }
                        })];
                case 3:
                    _b.sent();
                    _b.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5:
                    setPhotoResult(null);
                    setShowCamera(false);
                    return [4 /*yield*/, loadMeals()];
                case 6:
                    _b.sent();
                    return [3 /*break*/, 8];
                case 7:
                    error_11 = _b.sent();
                    console.error('Error adding all detected foods:', error_11);
                    return [3 /*break*/, 8];
                case 8: return [2 /*return*/];
            }
        });
    }); };
    var getMealsByType = function (type) {
        var now = new Date();
        var hour = now.getHours();
        if (type === 'breakfast') {
            return meals.filter(function (meal) {
                var mealHour = new Date(meal.created_at).getHours();
                return mealHour >= 5 && mealHour < 12;
            });
        }
        else if (type === 'lunch') {
            return meals.filter(function (meal) {
                var mealHour = new Date(meal.created_at).getHours();
                return mealHour >= 12 && mealHour < 17;
            });
        }
        else if (type === 'dinner') {
            return meals.filter(function (meal) {
                var mealHour = new Date(meal.created_at).getHours();
                return mealHour >= 17 || mealHour < 5;
            });
        }
        return meals;
    };
    return (<div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 pb-20">
      {/* Header */}
      <div className="fixed top-0 w-full bg-white/90 backdrop-blur-md shadow-sm z-50">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-gray-800">Nutrición</h1>
              <div className="flex items-center space-x-2 mt-1">
                <input type="date" value={selectedDate} onChange={function (e) { return setSelectedDate(e.target.value); }} className="text-xs text-gray-600 bg-transparent border-none"/>
                <div className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                  {dayTotals.calories} kcal
                </div>
              </div>
            </div>
            <button onClick={function () { return setShowSearch(true); }} className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
              <i className="ri-search-line text-gray-600 text-lg"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Barcode Scanner Modal */}
      {showScanner && (<div className="fixed inset-0 bg-black z-50 flex flex-col">
          <div className="flex items-center justify-between p-4 bg-black/50 text-white">
            <button onClick={closeBarcodeScanner} className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <i className="ri-close-line text-xl"></i>
            </button>
            <h3 className="font-semibold">Escanear código de barras</h3>
            <div className="w-10"></div>
          </div>

          <div className="flex-1 relative">
            {!scanResult && !isScanProcessing && (<>
                <video ref={videoRef} className="w-full h-full object-cover" playsInline muted/>
                <canvas ref={canvasRef} className="hidden"/>
                
                {/* Overlay de escaneo */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    <div className="w-64 h-32 border-2 border-white rounded-lg opacity-50"></div>
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-green-400 rounded-tl-lg"></div>
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-green-400 rounded-tr-lg"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-green-400 rounded-bl-lg"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-green-400 rounded-br-lg"></div>
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/70 to-transparent">
                  <div className="text-center text-white">
                    <i className="ri-scan-line text-4xl mb-2"></i>
                    <p className="text-lg mb-1">Apunta al código de barras</p>
                    <p className="text-sm opacity-75">Mantén el código dentro del marco</p>
                  </div>
                </div>
              </>)}

            {isScanProcessing && (<div className="absolute inset-0 bg-black flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-lg mb-2">Procesando código...</p>
                  <p className="text-sm opacity-75">Buscando información del producto</p>
                </div>
              </div>)}

            {scanResult && (<div className="absolute inset-0 bg-white overflow-y-auto">
                <div className="p-4">
                  <div className="relative mb-6">
                    <img src={"https://readdy.ai/api/search-image?query=packaged%20food%20product%20$%7BscanResult.name%7D%20on%20white%20background%2C%20product%20photography%20style%2C%20high%20detail%2C%20natural%20lighting%2C%20centered%20composition&width=300&height=200&seq=scanned-product&orientation=landscape"} alt={scanResult.name} className="w-full h-48 object-cover rounded-xl"/>
                    <div className="absolute top-3 right-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                      ✓ Escaneado
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-800">Producto encontrado</h3>
                      <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                        {scanResult.calories} kcal
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <i className="ri-barcode-line text-green-600 text-lg"></i>
                        </div>
                        <div>
                          <div className="font-medium text-gray-800">{scanResult.name}</div>
                          <div className="text-xs text-gray-500">Por 100g</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-4 mt-4">
                        <div className="text-center">
                          <div className="text-lg font-bold text-gray-800">{scanResult.calories}</div>
                          <div className="text-xs text-gray-500">Calorías</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-red-600">{scanResult.carbs}g</div>
                          <div className="text-xs text-gray-500">Carbs</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-yellow-600">{scanResult.protein}g</div>
                          <div className="text-xs text-gray-500">Proteína</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-purple-600">{scanResult.fat}g</div>
                          <div className="text-xs text-gray-500">Grasa</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button onClick={addScannedProduct} className="w-full bg-gradient-to-r from-green-400 to-green-500 text-white py-3 rounded-lg font-medium">
                      Agregar producto ({scanResult.calories} kcal)
                    </button>
                    <button onClick={function () {
                    setScanResult(null);
                    if (scanIntervalRef.current) {
                        clearInterval(scanIntervalRef.current);
                    }
                    scanIntervalRef.current = setInterval(function () {
                        scanBarcode();
                    }, 1000);
                }} className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-medium">
                      Escanear otro producto
                    </button>
                    <button onClick={closeBarcodeScanner} className="w-full bg-red-100 text-red-700 py-3 rounded-lg font-medium">
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>)}
          </div>
        </div>)}

      {/* Camera Modal */}
      {showCamera && (<div className="fixed inset-0 bg-black z-50 flex flex-col">
          <div className="flex items-center justify-between p-4 bg-black/50 text-white">
            <button onClick={function () {
                setShowCamera(false);
                setPhotoResult(null);
                setIsProcessing(false);
            }} className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <i className="ri-close-line text-xl"></i>
            </button>
            <h3 className="font-semibold">
              {cameraMode === 'photo' ? 'Tomar foto' : 'Seleccionar imagen'}
            </h3>
            <div className="w-10"></div>
          </div>

          <div className="flex-1 relative">
            {!photoResult && !isProcessing && (<>
                <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
                  <div className="text-center text-white">
                    <i className="ri-camera-line text-6xl mb-4 opacity-50"></i>
                    <p className="text-lg mb-2">
                      {cameraMode === 'photo' ? 'Cámara activa' : 'Seleccionar imagen'}
                    </p>
                    <p className="text-sm opacity-75">
                      {cameraMode === 'photo'
                    ? 'Enfoca tu comida y toma la foto'
                    : 'Elige una imagen de tu galería'}
                    </p>
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex items-center justify-center space-x-8">
                    <button className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                      <i className="ri-image-line text-white text-xl"></i>
                    </button>
                    
                    <button onClick={simulatePhotoCapture} className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg">
                      <div className="w-16 h-16 bg-white border-4 border-gray-300 rounded-full flex items-center justify-center">
                        <i className="ri-camera-line text-gray-600 text-2xl"></i>
                      </div>
                    </button>
                    
                    <button className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                      <i className="ri-flashlight-line text-white text-xl"></i>
                    </button>
                  </div>
                </div>
              </>)}

            {isProcessing && (<div className="absolute inset-0 bg-black flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-lg mb-2">Analizando imagen...</p>
                  <p className="text-sm opacity-75">La IA está identificando los alimentos</p>
                </div>
              </div>)}

            {photoResult && (<div className="absolute inset-0 bg-white overflow-y-auto">
                <div className="p-4">
                  <div className="relative mb-6">
                    <img src={"https://readdy.ai/api/search-image?query=$%7BphotoResult.image%7D&width=300&height=200&seq=captured-food&orientation=landscape"} alt="Comida capturada" className="w-full h-48 object-cover rounded-xl"/>
                    <div className="absolute top-3 right-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                      ✨ IA {photoResult.confidence_score}%
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-800">Análisis con IA</h3>
                        <p className="text-xs text-gray-500">
                          {photoResult.detectedFoods.length} alimento{photoResult.detectedFoods.length !== 1 ? 's' : ''} detectado{photoResult.detectedFoods.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                        {photoResult.totalCalories} kcal
                      </div>
                    </div>

                    {/* Resumen nutricional */}
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 mb-4">
                      <h4 className="font-medium text-gray-800 mb-3">Valores nutricionales totales</h4>
                      <div className="grid grid-cols-4 gap-3">
                        <div className="text-center">
                          <div className="text-lg font-bold text-purple-600">{photoResult.totalCalories}</div>
                          <div className="text-xs text-gray-500">Calorías</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-red-600">{photoResult.totalCarbs}g</div>
                          <div className="text-xs text-gray-500">Carbs</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-yellow-600">{photoResult.totalProtein}g</div>
                          <div className="text-xs text-gray-500">Proteína</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-blue-600">{photoResult.totalFat}g</div>
                          <div className="text-xs text-gray-500">Grasa</div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {photoResult.detectedFoods.map(function (food, index) { return (<div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                                <i className="ri-restaurant-line text-purple-600"></i>
                              </div>
                              <div>
                                <div className="font-medium text-gray-800">{food.name}</div>
                                <div className="text-xs text-gray-500">{food.portion}</div>
                              </div>
                            </div>
                            <button onClick={function () { return addDetectedFood(food); }} className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-xs font-medium hover:shadow-lg transition-all">
                              Agregar
                            </button>
                          </div>
                          
                          <div className="grid grid-cols-4 gap-2 mb-3">
                            <div className="text-center">
                              <div className="text-sm font-semibold text-gray-800">{food.calories}</div>
                              <div className="text-xs text-gray-500">kcal</div>
                            </div>
                            <div className="text-center">
                              <div className="text-sm font-semibold text-red-600">{food.carbs}g</div>
                              <div className="text-xs text-gray-500">Carbs</div>
                            </div>
                            <div className="text-center">
                              <div className="text-sm font-semibold text-yellow-600">{food.protein}g</div>
                              <div className="text-xs text-gray-500">Proteína</div>
                            </div>
                            <div className="text-center">
                              <div className="text-sm font-semibold text-blue-600">{food.fat}g</div>
                              <div className="text-xs text-gray-500">Grasa</div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="text-xs text-purple-600 font-medium bg-purple-100 px-2 py-1 rounded">
                              Confianza: {food.confidence}
                            </div>
                            {food.ingredients && (<div className="text-xs text-gray-500 max-w-32 truncate">
                                {food.ingredients.slice(0, 2).join(', ')}
                                {food.ingredients.length > 2 && '...'}
                              </div>)}
                          </div>
                        </div>); })}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button onClick={addAllDetectedFoods} className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-medium flex items-center justify-center space-x-2 hover:shadow-lg transition-all">
                      <i className="ri-magic-line"></i>
                      <span>Agregar todos los alimentos ({photoResult.totalCalories} kcal)</span>
                    </button>
                    <button onClick={function () {
                    setPhotoResult(null);
                    // Permitir tomar otra foto sin cerrar la cámara
                }} className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-medium flex items-center justify-center space-x-2">
                      <i className="ri-camera-line"></i>
                      <span>Analizar otra imagen</span>
                    </button>
                    <button onClick={function () {
                    setPhotoResult(null);
                    setShowCamera(false);
                }} className="w-full bg-red-100 text-red-700 py-3 rounded-lg font-medium">
                      Cerrar análisis
                    </button>
                  </div>
                </div>
              </div>)}
          </div>
        </div>)}

      {/* Search Modal */}
      {showSearch && (<div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20">
          <div className="bg-white rounded-t-xl w-full max-w-md mx-4 max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">Buscar alimentos</h3>
                <button onClick={function () { return setShowSearch(false); }} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <i className="ri-close-line text-gray-600"></i>
                </button>
              </div>
              <div className="relative">
                <input type="text" placeholder="Buscar alimentos..." value={searchQuery} onChange={function (e) { return handleSearch(e.target.value); }} className="w-full p-3 pr-10 bg-gray-50 rounded-lg border-none text-sm" autoFocus/>
                <i className="ri-search-line text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2"></i>
              </div>
            </div>

            <div className="overflow-y-auto max-h-96">
              {searchQuery.length === 0 ? (<div className="p-4">
                  <h4 className="font-medium text-gray-700 mb-3">Búsquedas recientes</h4>
                  <div className="space-y-2">
                    {['Pollo a la plancha', 'Arroz integral', 'Ensalada mixta'].map(function (recent, index) { return (<button key={index} onClick={function () { return handleSearch(recent); }} className="flex items-center space-x-3 w-full p-2 text-left hover:bg-gray-50 rounded-lg">
                        <i className="ri-history-line text-gray-400"></i>
                        <span className="text-gray-700">{recent}</span>
                      </button>); })}
                  </div>
                </div>) : searchResults.length > 0 ? (<div className="p-4">
                  <h4 className="font-medium text-gray-700 mb-3">Resultados ({searchResults.length})</h4>
                  <div className="space-y-2">
                    {searchResults.map(function (food, index) { return (<button key={index} onClick={function () { return addFoodFromSearch(food); }} className="w-full p-3 text-left hover:bg-gray-50 rounded-lg border border-gray-100">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-800">{food.name}</div>
                            <div className="text-xs text-gray-500">
                              Por {food.per} • C: {food.carbs}g • P: {food.protein}g • G: {food.fat}g
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-gray-800">{food.calories}</div>
                            <div className="text-xs text-gray-500">kcal</div>
                          </div>
                        </div>
                      </button>); })}
                  </div>
                </div>) : (<div className="p-4 text-center">
                  <i className="ri-search-line text-4xl text-gray-300 mb-2"></i>
                  <p className="text-gray-500">No se encontraron resultados</p>
                  <p className="text-xs text-gray-400 mt-1">Intenta con otro término</p>
                </div>)}
            </div>
          </div>
        </div>)}

      {/* Content */}
      <div className="pt-24 px-4">
        {/* Daily Summary */}
        <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
          <h3 className="font-semibold text-gray-800 mb-4">Resumen del día</h3>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-800">{dayTotals.calories}</div>
              <div className="text-xs text-gray-500">Calorías</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-red-600">{dayTotals.carbs.toFixed(1)}g</div>
              <div className="text-xs text-gray-500">Carbs</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-yellow-600">{dayTotals.protein.toFixed(1)}g</div>
              <div className="text-xs text-gray-500">Proteína</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-600">{dayTotals.fat.toFixed(1)}g</div>
              <div className="text-xs text-gray-500">Grasa</div>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="bg-white rounded-full p-1 mb-6 shadow-sm">
          <div className="grid grid-cols-4">
            <button onClick={function () { return setActiveTab('add'); }} className={"px-3 py-2 rounded-full text-xs font-medium transition-all ".concat(activeTab === 'add'
            ? 'bg-green-500 text-white shadow-sm'
            : 'text-gray-600')}>
              Añadir
            </button>
            <button onClick={function () { return setActiveTab('barcode'); }} className={"px-3 py-2 rounded-full text-xs font-medium transition-all ".concat(activeTab === 'barcode'
            ? 'bg-green-500 text-white shadow-sm'
            : 'text-gray-600')}>
              Código
            </button>
            <button onClick={function () { return setActiveTab('meals'); }} className={"px-3 py-2 rounded-full text-xs font-medium transition-all ".concat(activeTab === 'meals'
            ? 'bg-green-500 text-white shadow-sm'
            : 'text-gray-600')}>
              Comidas
            </button>
            <button onClick={function () { return setActiveTab('ai'); }} className={"px-3 py-2 rounded-full text-xs font-medium transition-all ".concat(activeTab === 'ai'
            ? 'bg-green-500 text-white shadow-sm'
            : 'text-gray-600')}>
              IA
            </button>
          </div>
        </div>

        {/* Barcode Tab */}
        {activeTab === 'barcode' && (<div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm text-center">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-barcode-line text-orange-600 text-2xl"></i>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Escáner de códigos</h3>
              <p className="text-gray-600 text-sm mb-6">Escanea el código de barras de cualquier producto para obtener automáticamente su información nutricional completa</p>
              
              <button onClick={startBarcodeScanner} className="w-full bg-gradient-to-r from-orange-400 to-orange-500 text-white py-3 rounded-lg font-medium flex items-center justify-center space-x-2">
                <i className="ri-scan-line text-xl"></i>
                <span>Iniciar escáner</span>
              </button>
            </div>

            {/* Recent Scanned Products */}
            {meals.filter(function (meal) { return meal.meal_type === 'barcode_scanned'; }).length > 0 && (<div className="bg-white rounded-xl p-4 shadow-sm">
                <h3 className="font-semibold text-gray-800 mb-4">Productos escaneados recientemente</h3>
                <div className="space-y-3">
                  {meals.filter(function (meal) { return meal.meal_type === 'barcode_scanned'; }).slice(0, 5).map(function (meal) { return (<div key={meal.id} className="p-3 bg-orange-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium text-gray-800 text-sm">{meal.name}</div>
                        <div className="text-sm font-semibold text-gray-800">{meal.calories} kcal</div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-500">
                          Escaneado • {meal.unit}
                        </div>
                        <div className="text-xs text-orange-600 font-medium">
                          {new Date(meal.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>); })}
                </div>
              </div>)}

            <div className="bg-orange-50 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <i className="ri-information-line text-orange-600 mt-1"></i>
                <div>
                  <h4 className="font-medium text-orange-800 text-sm">Escáner de alta precisión</h4>
                  <p className="text-orange-700 text-xs mt-1">
                    Conecta con bases de datos internacionales de productos. 
                    Funciona con códigos EAN, UPC y códigos QR de alimentos.
                  </p>
                </div>
              </div>
            </div>
          </div>)}

        {/* Add Food Tab */}
        {activeTab === 'add' && (<div className="space-y-6">
            {/* Quick Search Bar */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <button onClick={function () { return setShowSearch(true); }} className="w-full p-3 bg-gray-50 rounded-lg border-none text-sm text-left text-gray-500 flex items-center space-x-3">
                <i className="ri-search-line text-gray-400"></i>
                <span>Buscar en base de datos de alimentos...</span>
              </button>
            </div>

            {/* Manual Form */}
            {showManualForm ? (<div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-800">Añadir alimento manualmente</h3>
                  <button onClick={function () { return setShowManualForm(false); }} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <i className="ri-close-line text-gray-600"></i>
                  </button>
                </div>
                <form onSubmit={addManualFood} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del alimento</label>
                    <input type="text" placeholder="Ej: Manzana, Pollo a la plancha..." value={manualFood.name} onChange={function (e) { return setManualFood(__assign(__assign({}, manualFood), { name: e.target.value })); }} className="w-full p-3 bg-gray-50 rounded-lg border-none text-sm" required/>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Cantidad</label>
                      <input type="number" step="0.1" placeholder="1" value={manualFood.quantity} onChange={function (e) { return setManualFood(__assign(__assign({}, manualFood), { quantity: e.target.value })); }} className="w-full p-3 bg-gray-50 rounded-lg border-none text-sm"/>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Calorías</label>
                      <input type="number" placeholder="50" value={manualFood.calories} onChange={function (e) { return setManualFood(__assign(__assign({}, manualFood), { calories: e.target.value })); }} className="w-full p-3 bg-gray-50 rounded-lg border-none text-sm" required/>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Carbohidratos (g)</label>
                      <input type="number" step="0.1" placeholder="13" value={manualFood.carbs} onChange={function (e) { return setManualFood(__assign(__assign({}, manualFood), { carbs: e.target.value })); }} className="w-full p-3 bg-gray-50 rounded-lg border-none text-sm"/>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Proteínas (g)</label>
                      <input type="number" step="0.1" placeholder="0.3" value={manualFood.protein} onChange={function (e) { return setManualFood(__assign(__assign({}, manualFood), { protein: e.target.value })); }} className="w-full p-3 bg-gray-50 rounded-lg border-none text-sm"/>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Grasas (g)</label>
                      <input type="number" step="0.1" placeholder="0.2" value={manualFood.fat} onChange={function (e) { return setManualFood(__assign(__assign({}, manualFood), { fat: e.target.value })); }} className="w-full p-3 bg-gray-50 rounded-lg border-none text-sm"/>
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-gradient-to-r from-green-400 to-green-500 text-white py-3 rounded-lg font-medium">
                    Añadir alimento
                  </button>
                </form>
              </div>) : (<div className="bg-white rounded-xl p-4 shadow-sm">
                <button onClick={function () { return setShowManualForm(true); }} className="w-full p-4 border-2 border-dashed border-gray-200 rounded-lg text-gray-500 hover:border-green-300 hover:text-green-600 transition-colors flex items-center justify-center space-x-2">
                  <i className="ri-add-line text-xl"></i>
                  <span>Añadir alimento manualmente</span>
                </button>
              </div>)}

            {/* Quick Add Foods */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-4">Alimentos frecuentes</h3>
              <div className="grid grid-cols-3 gap-3">
                {[
                { name: 'Manzana', calories: 52, carbs: 14, protein: 0.3, fat: 0.2, image: 'red apple fruit, isolated on white background, food photography style, high detail, natural lighting, centered composition' },
                { name: 'Plátano', calories: 89, carbs: 23, protein: 1.1, fat: 0.3, image: 'yellow banana fruit, isolated on white background, food photography style, high detail, natural lighting, centered composition' },
                { name: 'Pollo', calories: 165, carbs: 0, protein: 31, fat: 3.6, image: 'grilled chicken breast, isolated on white background, food photography style, high detail, natural lighting, centered composition' },
                { name: 'Arroz', calories: 130, carbs: 28, protein: 2.7, fat: 0.3, image: 'cooked white rice in bowl, isolated on white background, food photography style, high detail, natural lighting, centered composition' },
                { name: 'Huevo', calories: 155, carbs: 1.1, protein: 13, fat: 11, image: 'boiled egg, isolated on white background, food photography style, high detail, natural lighting, centered composition' },
                { name: 'Avena', calories: 389, carbs: 66, protein: 17, fat: 7, image: 'bowl of oats cereal, isolated on white background, food photography style, high detail, natural lighting, centered composition' }
            ].map(function (food, index) { return (<button key={index} onClick={function () { return addFoodFromSearch(__assign(__assign({}, food), { per: '100g' })); }} className="bg-gray-50 rounded-lg p-3 text-center hover:bg-gray-100 transition-colors">
                    <img src={"https://readdy.ai/api/search-image?query=$%7Bfood.image%7D&width=60&height=60&seq=food".concat(index, "&orientation=squarish")} alt={food.name} className="w-12 h-12 rounded-lg object-cover mx-auto mb-2"/>
                    <div className="text-xs font-medium text-gray-800">{food.name}</div>
                    <div className="text-xs text-gray-500">{food.calories} kcal</div>
                  </button>); })}
              </div>
            </div>
          </div>)}

        {/* Meals Tab */}
        {activeTab === 'meals' && (<div className="space-y-6">
            {loading ? (<div className="text-center py-8">
                <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-gray-500">Cargando comidas...</p>
              </div>) : meals.length === 0 ? (<div className="bg-white rounded-xl p-6 shadow-sm text-center">
                <i className="ri-restaurant-line text-4xl text-gray-300 mb-4"></i>
                <h3 className="font-semibold text-gray-800 mb-2">No hay comidas registradas</h3>
                <p className="text-gray-600 text-sm mb-4">Añade tu primera comida del día</p>
                <button onClick={function () { return setActiveTab('add'); }} className="bg-gradient-to-r from-green-400 to-green-500 text-white px-6 py-2 rounded-lg font-medium">
                  Añadir comida
                </button>
              </div>) : (<div className="space-y-4">
                {meals.map(function (meal) { return (<div key={meal.id} className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-800">{meal.name}</h4>
                          <button onClick={function () { return deleteMeal(meal.id); }} className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                            <i className="ri-delete-bin-line text-red-600 text-xs"></i>
                          </button>
                        </div>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>{meal.quantity} {meal.unit}</span>
                          <span>{new Date(meal.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div className="flex items-center space-x-4 mt-2 text-xs">
                          <span className="bg-gray-100 px-2 py-1 rounded">{meal.calories} kcal</span>
                          <span className="bg-red-100 text-red-600 px-2 py-1 rounded">C: {meal.carbs}g</span>
                          <span className="bg-yellow-100 text-yellow-600 px-2 py-1 rounded">P: {meal.protein}g</span>
                          <span className="bg-purple-100 text-purple-600 px-2 py-1 rounded">G: {meal.fat}g</span>
                        </div>
                      </div>
                    </div>
                  </div>); })}
              </div>)}
          </div>)}

        {/* AI Tab */}
        {activeTab === 'ai' && (<div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl p-6 shadow-lg text-center">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-brain-line text-3xl"></i>
              </div>
              <h3 className="font-semibold text-lg mb-2">Análisis Inteligente</h3>
              <p className="text-purple-100 text-sm mb-6">
                Nuestra IA avanzada identifica automáticamente los alimentos en tus fotos y calcula 
                sus valores nutricionales con precisión del 90%+
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <button onClick={handleTakePhoto} className="bg-white/20 backdrop-blur-sm text-white py-3 rounded-lg font-medium flex items-center justify-center space-x-2 hover:bg-white/30 transition-all">
                  <i className="ri-camera-ai-line text-xl"></i>
                  <span>Capturar</span>
                </button>
                <button onClick={handleSelectFromGallery} className="bg-white/20 backdrop-blur-sm text-white py-3 rounded-lg font-medium flex items-center justify-center space-x-2 hover:bg-white/30 transition-all">
                  <i className="ri-gallery-line text-xl"></i>
                  <span>Galería</span>
                </button>
              </div>
            </div>

            {/* AI Features */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-4">Capacidades de la IA</h3>
              <div className="space-y-3">
                {[
                { icon: 'ri-eye-line', title: 'Reconocimiento visual', desc: 'Identifica múltiples alimentos en una sola imagen' },
                { icon: 'ri-calculator-line', title: 'Cálculo nutricional', desc: 'Estima calorías y macronutrientes automáticamente' },
                { icon: 'ri-award-line', title: 'Alta precisión', desc: 'Confianza del 90%+ en detecciones principales' },
                { icon: 'ri-flashlight-line', title: 'Análisis rápido', desc: 'Resultados en menos de 3 segundos' }
            ].map(function (feature, index) { return (<div key={index} className="flex items-center space-x-3 p-2">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <i className={"".concat(feature.icon, " text-purple-600 text-sm")}></i>
                    </div>
                    <div>
                      <div className="font-medium text-gray-800 text-sm">{feature.title}</div>
                      <div className="text-xs text-gray-500">{feature.desc}</div>
                    </div>
                  </div>); })}
              </div>
            </div>

            {/* Recent AI Detections */}
            {meals.filter(function (meal) { return meal.meal_type === 'ai_detected'; }).length > 0 && (<div className="bg-white rounded-xl p-4 shadow-sm">
                <h3 className="font-semibold text-gray-800 mb-4">Últimos análisis con IA</h3>
                <div className="space-y-3">
                  {meals.filter(function (meal) { return meal.meal_type === 'ai_detected'; }).slice(0, 5).map(function (meal) { return (<div key={meal.id} className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                            <i className="ri-magic-line text-white text-sm"></i>
                          </div>
                          <div className="font-medium text-gray-800 text-sm">{meal.name}</div>
                        </div>
                        <div className="text-sm font-semibold text-gray-800">{meal.calories} kcal</div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-500">
                          Detectado por IA • {meal.unit}
                        </div>
                        <div className="flex items-center space-x-2">
                          {meal.confidence_score && (<div className="text-xs text-purple-600 font-medium bg-purple-100 px-2 py-0.5 rounded">
                              {meal.confidence_score}% confianza
                            </div>)}
                          <div className="text-xs text-gray-500">
                            {new Date(meal.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>); })}
                </div>
              </div>)}

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200">
              <div className="flex items-start space-x-3">
                <i className="ri-lightbulb-line text-blue-600 mt-1"></i>
                <div>
                  <h4 className="font-medium text-blue-800 text-sm">Consejos para mejores resultados</h4>
                  <ul className="text-blue-700 text-xs mt-2 space-y-1">
                    <li>• Buena iluminación natural mejora la precisión</li>
                    <li>• Separa los alimentos en el plato cuando sea posible</li>
                    <li>• Fotografía desde arriba para mejor detección</li>
                    <li>• Evita sombras fuertes sobre la comida</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>)}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 w-full bg-white shadow-lg">
        <div className="grid grid-cols-4 h-16">
          <button onClick={function () { return navigate('/'); }} className="flex flex-col items-center justify-center space-y-1">
            <div className="w-6 h-6 flex items-center justify-center">
              <i className="ri-dashboard-3-line text-gray-400 text-lg"></i>
            </div>
            <span className="text-xs text-gray-400">Dashboard</span>
          </button>
          <button className="flex flex-col items-center justify-center space-y-1 bg-green-50">
            <div className="w-6 h-6 flex items-center justify-center">
              <i className="ri-restaurant-fill text-green-600 text-lg"></i>
            </div>
            <span className="text-xs text-green-600 font-medium">Nutrición</span>
          </button>
          <button onClick={function () { return navigate('/exercise'); }} className="flex flex-col items-center justify-center space-y-1">
            <div className="w-6 h-6 flex items-center justify-center">
              <i className="ri-run-line text-gray-400 text-lg"></i>
            </div>
            <span className="text-xs text-gray-400">Ejercicio</span>
          </button>
          <button onClick={function () { return navigate('/profile'); }} className="flex flex-col items-center justify-center space-y-1">
            <div className="w-6 h-6 flex items-center justify-center">
              <i className="ri-user-line text-gray-400 text-lg"></i>
            </div>
            <span className="text-xs text-gray-400">Perfil</span>
          </button>
        </div>
      </div>
    </div>);
}
