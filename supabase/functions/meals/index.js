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
    var supabaseClient, user, url, method, date, _a, data, error, totals, body, _b, data, error, mealId, error, query_1, foodDatabase, results, barcode_1, productDatabase, product, error_1;
    var _c, _d;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                if (req.method === 'OPTIONS') {
                    return [2 /*return*/, new Response('ok', { headers: corsHeaders })];
                }
                _e.label = 1;
            case 1:
                _e.trys.push([1, 14, , 15]);
                supabaseClient = (0, supabase_js_2_1.createClient)((_c = Deno.env.get('SUPABASE_URL')) !== null && _c !== void 0 ? _c : '', (_d = Deno.env.get('SUPABASE_ANON_KEY')) !== null && _d !== void 0 ? _d : '', {
                    global: {
                        headers: { Authorization: req.headers.get('Authorization') },
                    },
                });
                return [4 /*yield*/, supabaseClient.auth.getUser()];
            case 2:
                user = (_e.sent()).data.user;
                if (!user) {
                    return [2 /*return*/, new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: __assign(__assign({}, corsHeaders), { 'Content-Type': 'application/json' }) })];
                }
                url = new URL(req.url);
                method = req.method;
                if (!(method === 'GET' && url.pathname === '/meals')) return [3 /*break*/, 4];
                date = url.searchParams.get('date') || new Date().toISOString().split('T')[0];
                return [4 /*yield*/, supabaseClient
                        .from('meals')
                        .select('*')
                        .eq('user_id', user.id)
                        .gte('created_at', "".concat(date, "T00:00:00.000Z"))
                        .lt('created_at', "".concat(date, "T23:59:59.999Z"))
                        .order('created_at', { ascending: true })];
            case 3:
                _a = _e.sent(), data = _a.data, error = _a.error;
                if (error)
                    throw error;
                totals = data.reduce(function (acc, meal) { return ({
                    calories: acc.calories + (meal.calories || 0),
                    carbs: acc.carbs + (meal.carbs || 0),
                    protein: acc.protein + (meal.protein || 0),
                    fat: acc.fat + (meal.fat || 0),
                }); }, { calories: 0, carbs: 0, protein: 0, fat: 0 });
                return [2 /*return*/, new Response(JSON.stringify({ meals: data, totals: totals }), { headers: __assign(__assign({}, corsHeaders), { 'Content-Type': 'application/json' }) })];
            case 4:
                if (!(method === 'POST' && url.pathname === '/meals')) return [3 /*break*/, 7];
                return [4 /*yield*/, req.json()];
            case 5:
                body = _e.sent();
                return [4 /*yield*/, supabaseClient
                        .from('meals')
                        .insert({
                        user_id: user.id,
                        name: body.name,
                        calories: body.calories,
                        carbs: body.carbs || 0,
                        protein: body.protein || 0,
                        fat: body.fat || 0,
                        quantity: body.quantity || 1,
                        unit: body.unit || 'porción',
                        meal_type: body.meal_type || 'snack',
                        created_at: new Date().toISOString(),
                    })
                        .select()
                        .single()];
            case 6:
                _b = _e.sent(), data = _b.data, error = _b.error;
                if (error)
                    throw error;
                return [2 /*return*/, new Response(JSON.stringify({ meal: data }), { headers: __assign(__assign({}, corsHeaders), { 'Content-Type': 'application/json' }) })];
            case 7:
                if (!(method === 'DELETE' && url.pathname.startsWith('/meals/'))) return [3 /*break*/, 9];
                mealId = url.pathname.split('/')[2];
                return [4 /*yield*/, supabaseClient
                        .from('meals')
                        .delete()
                        .eq('id', mealId)
                        .eq('user_id', user.id)];
            case 8:
                error = (_e.sent()).error;
                if (error)
                    throw error;
                return [2 /*return*/, new Response(JSON.stringify({ success: true }), { headers: __assign(__assign({}, corsHeaders), { 'Content-Type': 'application/json' }) })];
            case 9:
                if (!(method === 'POST' && url.pathname === '/meals/search')) return [3 /*break*/, 11];
                return [4 /*yield*/, req.json()];
            case 10:
                query_1 = (_e.sent()).query;
                foodDatabase = [
                    { name: 'Manzana', calories: 52, carbs: 14, protein: 0.3, fat: 0.2, per: '100g' },
                    { name: 'Plátano', calories: 89, carbs: 23, protein: 1.1, fat: 0.3, per: '100g' },
                    { name: 'Pollo a la plancha', calories: 165, carbs: 0, protein: 31, fat: 3.6, per: '100g' },
                    { name: 'Arroz blanco', calories: 130, carbs: 28, protein: 2.7, fat: 0.3, per: '100g' },
                    { name: 'Arroz integral', calories: 111, carbs: 23, protein: 2.6, fat: 0.9, per: '100g' },
                    { name: 'Huevo cocido', calories: 155, carbs: 1.1, protein: 13, fat: 11, per: '100g' },
                    { name: 'Avena', calories: 389, carbs: 66, protein: 17, fat: 7, per: '100g' },
                    { name: 'Salmón', calories: 208, carbs: 0, protein: 20, fat: 13, per: '100g' },
                    { name: 'Brócoli', calories: 34, carbs: 7, protein: 3, fat: 0.4, per: '100g' },
                    { name: 'Yogur griego', calories: 59, carbs: 4, protein: 10, fat: 0.4, per: '100g' },
                    { name: 'Almendras', calories: 579, carbs: 22, protein: 21, fat: 50, per: '100g' },
                    { name: 'Pasta integral', calories: 124, carbs: 23, protein: 5, fat: 1.1, per: '100g' },
                    { name: 'Quinoa', calories: 120, carbs: 22, protein: 4.4, fat: 1.9, per: '100g' },
                    { name: 'Pechuga de pavo', calories: 135, carbs: 0, protein: 30, fat: 1, per: '100g' },
                    { name: 'Atún en agua', calories: 116, carbs: 0, protein: 26, fat: 1, per: '100g' },
                    { name: 'Lentejas', calories: 116, carbs: 20, protein: 9, fat: 0.4, per: '100g' },
                    { name: 'Espinacas', calories: 23, carbs: 3.6, protein: 2.9, fat: 0.4, per: '100g' },
                    { name: 'Tomate', calories: 18, carbs: 3.9, protein: 0.9, fat: 0.2, per: '100g' },
                    { name: 'Aguacate', calories: 160, carbs: 9, protein: 2, fat: 15, per: '100g' },
                    { name: 'Pan integral', calories: 247, carbs: 41, protein: 13, fat: 4, per: '100g' },
                    { name: 'Leche descremada', calories: 34, carbs: 5, protein: 3.4, fat: 0.1, per: '100ml' },
                    { name: 'Queso cottage', calories: 98, carbs: 3.4, protein: 11, fat: 4.3, per: '100g' },
                ];
                results = foodDatabase.filter(function (food) {
                    return food.name.toLowerCase().includes(query_1.toLowerCase());
                }).slice(0, 10);
                return [2 /*return*/, new Response(JSON.stringify({ results: results }), { headers: __assign(__assign({}, corsHeaders), { 'Content-Type': 'application/json' }) })];
            case 11:
                if (!(method === 'POST' && url.pathname === '/meals/barcode')) return [3 /*break*/, 13];
                return [4 /*yield*/, req.json()];
            case 12:
                barcode_1 = (_e.sent()).barcode;
                productDatabase = [
                    {
                        barcode: '7501000123456',
                        name: 'Yogur Natural Danone 150g',
                        calories: 89,
                        carbs: 12,
                        protein: 5,
                        fat: 3.2,
                        brand: 'Danone',
                        category: 'Lácteos'
                    },
                    {
                        barcode: '7501000234567',
                        name: 'Leche Descremada Lala 1L',
                        calories: 35,
                        carbs: 5,
                        protein: 3.5,
                        fat: 0.1,
                        brand: 'Lala',
                        category: 'Lácteos'
                    },
                    {
                        barcode: '7501000345678',
                        name: 'Cereal Fitness Nestlé 300g',
                        calories: 375,
                        carbs: 75,
                        protein: 8,
                        fat: 3,
                        brand: 'Nestlé',
                        category: 'Cereales'
                    },
                    {
                        barcode: '7501000456789',
                        name: 'Atún en Agua Herdez 140g',
                        calories: 116,
                        carbs: 0,
                        protein: 26,
                        fat: 1,
                        brand: 'Herdez',
                        category: 'Conservas'
                    },
                    {
                        barcode: '7501000567890',
                        name: 'Pan Integral Bimbo 680g',
                        calories: 250,
                        carbs: 42,
                        protein: 12,
                        fat: 4.5,
                        brand: 'Bimbo',
                        category: 'Panadería'
                    },
                    {
                        barcode: '7501000678901',
                        name: 'Pasta Integral Barilla 500g',
                        calories: 350,
                        carbs: 70,
                        protein: 12,
                        fat: 2.5,
                        brand: 'Barilla',
                        category: 'Pasta'
                    },
                    {
                        barcode: '7501000789012',
                        name: 'Quinoa Real Orgánica 500g',
                        calories: 368,
                        carbs: 64,
                        protein: 14,
                        fat: 6,
                        brand: 'Real',
                        category: 'Granos'
                    },
                    {
                        barcode: '7501000890123',
                        name: 'Almendras Natural Great Value 200g',
                        calories: 579,
                        carbs: 22,
                        protein: 21,
                        fat: 50,
                        brand: 'Great Value',
                        category: 'Frutos secos'
                    },
                    {
                        barcode: '7501000901234',
                        name: 'Aceite de Oliva Extra Virgen Capullo 500ml',
                        calories: 884,
                        carbs: 0,
                        protein: 0,
                        fat: 100,
                        brand: 'Capullo',
                        category: 'Aceites'
                    },
                    {
                        barcode: '7501001012345',
                        name: 'Miel de Abeja Pura Carlota 300g',
                        calories: 304,
                        carbs: 82,
                        protein: 0.3,
                        fat: 0,
                        brand: 'Carlota',
                        category: 'Endulzantes'
                    }
                ];
                product = productDatabase.find(function (p) { return p.barcode === barcode_1; });
                if (product) {
                    return [2 /*return*/, new Response(JSON.stringify({
                            success: true,
                            product: __assign(__assign({}, product), { per: '100g' })
                        }), { headers: __assign(__assign({}, corsHeaders), { 'Content-Type': 'application/json' }) })];
                }
                else {
                    // Si no se encuentra, devolver producto genérico
                    return [2 /*return*/, new Response(JSON.stringify({
                            success: false,
                            product: {
                                barcode: barcode_1,
                                name: 'Producto no encontrado',
                                calories: 0,
                                carbs: 0,
                                protein: 0,
                                fat: 0,
                                brand: 'Desconocido',
                                category: 'Sin categoría',
                                per: '100g'
                            }
                        }), { headers: __assign(__assign({}, corsHeaders), { 'Content-Type': 'application/json' }) })];
                }
                _e.label = 13;
            case 13: return [2 /*return*/, new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: __assign(__assign({}, corsHeaders), { 'Content-Type': 'application/json' }) })];
            case 14:
                error_1 = _e.sent();
                return [2 /*return*/, new Response(JSON.stringify({ error: error_1.message }), { status: 500, headers: __assign(__assign({}, corsHeaders), { 'Content-Type': 'application/json' }) })];
            case 15: return [2 /*return*/];
        }
    });
}); });
