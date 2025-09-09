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
Object.defineProperty(exports, "__esModule", { value: true });
var server_ts_1 = require("https://deno.land/std@0.168.0/http/server.ts");
var supabase_js_2_1 = require("https://esm.sh/@supabase/supabase-js@2");
var corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};
(0, server_ts_1.serve)(function (req) { return __awaiter(void 0, void 0, void 0, function () {
    var supabaseClient, user, barcode_1, searchOpenFoodFacts, localProductDatabase, localProduct, openFoodResult, error_1, error_2;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                if (req.method === 'OPTIONS') {
                    return [2 /*return*/, new Response('ok', { headers: corsHeaders })];
                }
                _c.label = 1;
            case 1:
                _c.trys.push([1, 10, , 11]);
                supabaseClient = (0, supabase_js_2_1.createClient)((_a = Deno.env.get('SUPABASE_URL')) !== null && _a !== void 0 ? _a : '', (_b = Deno.env.get('SUPABASE_ANON_KEY')) !== null && _b !== void 0 ? _b : '', {
                    global: {
                        headers: { Authorization: req.headers.get('Authorization') },
                    },
                });
                return [4 /*yield*/, supabaseClient.auth.getUser()];
            case 2:
                user = (_c.sent()).data.user;
                if (!user) {
                    return [2 /*return*/, new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: __assign(__assign({}, corsHeaders), { 'Content-Type': 'application/json' }) })];
                }
                return [4 /*yield*/, req.json()];
            case 3:
                barcode_1 = (_c.sent()).barcode;
                searchOpenFoodFacts = function (barcode) { return __awaiter(void 0, void 0, void 0, function () {
                    var response, data, product, nutriments, error_3;
                    var _a, _b;
                    return __generator(this, function (_c) {
                        switch (_c.label) {
                            case 0:
                                _c.trys.push([0, 3, , 4]);
                                return [4 /*yield*/, fetch("https://world.openfoodfacts.org/api/v0/product/".concat(barcode, ".json"))];
                            case 1:
                                response = _c.sent();
                                return [4 /*yield*/, response.json()];
                            case 2:
                                data = _c.sent();
                                if (data.status === 1 && data.product) {
                                    product = data.product;
                                    nutriments = product.nutriments || {};
                                    return [2 /*return*/, {
                                            success: true,
                                            product: {
                                                barcode: barcode,
                                                name: product.product_name || product.product_name_es || 'Producto sin nombre',
                                                calories: Math.round(nutriments.energy_kcal_100g || nutriments['energy-kcal_100g'] || 0),
                                                carbs: Math.round((nutriments.carbohydrates_100g || nutriments['carbohydrates_100g'] || 0) * 10) / 10,
                                                protein: Math.round((nutriments.proteins_100g || nutriments['proteins_100g'] || 0) * 10) / 10,
                                                fat: Math.round((nutriments.fat_100g || nutriments['fat_100g'] || 0) * 10) / 10,
                                                fiber: Math.round((nutriments.fiber_100g || nutriments['fiber_100g'] || 0) * 10) / 10,
                                                sodium: Math.round((nutriments.sodium_100g || nutriments['sodium_100g'] || 0) * 1000) / 1000,
                                                sugar: Math.round((nutriments.sugars_100g || nutriments['sugars_100g'] || 0) * 10) / 10,
                                                brand: product.brands || 'Marca desconocida',
                                                category: ((_b = (_a = product.categories_tags) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.replace('en:', '')) || 'Sin categoría',
                                                image_url: product.image_front_url || product.image_url,
                                                ingredients: product.ingredients_text || product.ingredients_text_es,
                                                per: '100g',
                                                source: 'openfoodfacts'
                                            }
                                        }];
                                }
                                return [2 /*return*/, { success: false, error: 'Producto no encontrado en Open Food Facts' }];
                            case 3:
                                error_3 = _c.sent();
                                console.error('Error fetching from Open Food Facts:', error_3);
                                return [2 /*return*/, { success: false, error: 'Error al consultar Open Food Facts' }];
                            case 4: return [2 /*return*/];
                        }
                    });
                }); };
                localProductDatabase = [
                    {
                        barcode: '7501000123456',
                        name: 'Yogur Natural Danone 150g',
                        calories: 89,
                        carbs: 12,
                        protein: 5,
                        fat: 3.2,
                        brand: 'Danone',
                        category: 'Lácteos',
                        source: 'local'
                    },
                    {
                        barcode: '7501000234567',
                        name: 'Leche Descremada Lala 1L',
                        calories: 35,
                        carbs: 5,
                        protein: 3.5,
                        fat: 0.1,
                        brand: 'Lala',
                        category: 'Lácteos',
                        source: 'local'
                    },
                    {
                        barcode: '7501000345678',
                        name: 'Cereal Fitness Nestlé 300g',
                        calories: 375,
                        carbs: 75,
                        protein: 8,
                        fat: 3,
                        brand: 'Nestlé',
                        category: 'Cereales',
                        source: 'local'
                    },
                    {
                        barcode: '7501000456789',
                        name: 'Atún en Agua Herdez 140g',
                        calories: 116,
                        carbs: 0,
                        protein: 26,
                        fat: 1,
                        brand: 'Herdez',
                        category: 'Conservas',
                        source: 'local'
                    },
                    {
                        barcode: '7501000567890',
                        name: 'Pan Integral Bimbo 680g',
                        calories: 250,
                        carbs: 42,
                        protein: 12,
                        fat: 4.5,
                        brand: 'Bimbo',
                        category: 'Panadería',
                        source: 'local'
                    },
                    {
                        barcode: '7501000678901',
                        name: 'Pasta Integral Barilla 500g',
                        calories: 350,
                        carbs: 70,
                        protein: 12,
                        fat: 2.5,
                        brand: 'Barilla',
                        category: 'Pasta',
                        source: 'local'
                    },
                    {
                        barcode: '7501000789012',
                        name: 'Quinoa Real Orgánica 500g',
                        calories: 368,
                        carbs: 64,
                        protein: 14,
                        fat: 6,
                        brand: 'Real',
                        category: 'Granos',
                        source: 'local'
                    },
                    {
                        barcode: '7501000890123',
                        name: 'Almendras Natural Great Value 200g',
                        calories: 579,
                        carbs: 22,
                        protein: 21,
                        fat: 50,
                        brand: 'Great Value',
                        category: 'Frutos secos',
                        source: 'local'
                    },
                    {
                        barcode: '7501000901234',
                        name: 'Aceite de Oliva Extra Virgen Capullo 500ml',
                        calories: 884,
                        carbs: 0,
                        protein: 0,
                        fat: 100,
                        brand: 'Capullo',
                        category: 'Aceites',
                        source: 'local'
                    },
                    {
                        barcode: '7501001012345',
                        name: 'Miel de Abeja Pura Carlota 300g',
                        calories: 304,
                        carbs: 82,
                        protein: 0.3,
                        fat: 0,
                        brand: 'Carlota',
                        category: 'Endulzantes',
                        source: 'local'
                    },
                    // Productos mexicanos adicionales
                    {
                        barcode: '7502000123456',
                        name: 'Tortillas de Maíz Maseca 1kg',
                        calories: 218,
                        carbs: 45,
                        protein: 6,
                        fat: 2.9,
                        brand: 'Maseca',
                        category: 'Tortillas',
                        source: 'local'
                    },
                    {
                        barcode: '7503000123456',
                        name: 'Frijoles Negros La Costeña 560g',
                        calories: 91,
                        carbs: 16,
                        protein: 6,
                        fat: 0.5,
                        brand: 'La Costeña',
                        category: 'Legumbres',
                        source: 'local'
                    }
                ];
                localProduct = localProductDatabase.find(function (p) { return p.barcode === barcode_1; });
                if (localProduct) {
                    return [2 /*return*/, new Response(JSON.stringify({
                            success: true,
                            product: __assign(__assign({}, localProduct), { per: '100g' })
                        }), { headers: __assign(__assign({}, corsHeaders), { 'Content-Type': 'application/json' }) })];
                }
                // Si no se encuentra localmente, buscar en Open Food Facts
                console.log("Searching barcode ".concat(barcode_1, " in Open Food Facts..."));
                return [4 /*yield*/, searchOpenFoodFacts(barcode_1)];
            case 4:
                openFoodResult = _c.sent();
                if (!openFoodResult.success) return [3 /*break*/, 9];
                _c.label = 5;
            case 5:
                _c.trys.push([5, 7, , 8]);
                return [4 /*yield*/, supabaseClient
                        .from('scanned_products')
                        .upsert({
                        barcode: barcode_1,
                        product_data: openFoodResult.product,
                        user_id: user.id,
                        created_at: new Date().toISOString()
                    })];
            case 6:
                _c.sent();
                return [3 /*break*/, 8];
            case 7:
                error_1 = _c.sent();
                console.error('Error saving to local cache:', error_1);
                return [3 /*break*/, 8];
            case 8: return [2 /*return*/, new Response(JSON.stringify(openFoodResult), { headers: __assign(__assign({}, corsHeaders), { 'Content-Type': 'application/json' }) })];
            case 9: 
            // Si no se encuentra en ningún lado, devolver error
            return [2 /*return*/, new Response(JSON.stringify({
                    success: false,
                    error: 'Producto no encontrado',
                    message: 'No se pudo encontrar información nutricional para este código de barras'
                }), { headers: __assign(__assign({}, corsHeaders), { 'Content-Type': 'application/json' }) })];
            case 10:
                error_2 = _c.sent();
                console.error('Error in barcode lookup:', error_2);
                return [2 /*return*/, new Response(JSON.stringify({
                        success: false,
                        error: error_2.message,
                        message: 'Error interno del servidor'
                    }), { status: 500, headers: __assign(__assign({}, corsHeaders), { 'Content-Type': 'application/json' }) })];
            case 11: return [2 /*return*/];
        }
    });
}); });
