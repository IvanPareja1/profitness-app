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
    var supabaseClient, user, url, method, date, _a, data, error, totals, body, caloriesBurned, duration, weight, _b, data, error, exerciseId, error, query_1, exerciseDatabase, results, _c, data, error, stats, error_1;
    var _d, _e;
    return __generator(this, function (_f) {
        switch (_f.label) {
            case 0:
                if (req.method === 'OPTIONS') {
                    return [2 /*return*/, new Response('ok', { headers: corsHeaders })];
                }
                _f.label = 1;
            case 1:
                _f.trys.push([1, 14, , 15]);
                supabaseClient = (0, supabase_js_2_1.createClient)((_d = Deno.env.get('SUPABASE_URL')) !== null && _d !== void 0 ? _d : '', (_e = Deno.env.get('SUPABASE_ANON_KEY')) !== null && _e !== void 0 ? _e : '', {
                    global: {
                        headers: { Authorization: req.headers.get('Authorization') },
                    },
                });
                return [4 /*yield*/, supabaseClient.auth.getUser()];
            case 2:
                user = (_f.sent()).data.user;
                if (!user) {
                    return [2 /*return*/, new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: __assign(__assign({}, corsHeaders), { 'Content-Type': 'application/json' }) })];
                }
                url = new URL(req.url);
                method = req.method;
                if (!(method === 'GET' && url.pathname === '/exercises')) return [3 /*break*/, 4];
                date = url.searchParams.get('date') || new Date().toISOString().split('T')[0];
                return [4 /*yield*/, supabaseClient
                        .from('exercises')
                        .select('*')
                        .eq('user_id', user.id)
                        .gte('created_at', "".concat(date, "T00:00:00.000Z"))
                        .lt('created_at', "".concat(date, "T23:59:59.999Z"))
                        .order('created_at', { ascending: false })];
            case 3:
                _a = _f.sent(), data = _a.data, error = _a.error;
                if (error)
                    throw error;
                totals = data.reduce(function (acc, exercise) { return ({
                    totalExercises: acc.totalExercises + 1,
                    totalDuration: acc.totalDuration + (exercise.duration || 0),
                    totalCalories: acc.totalCalories + (exercise.calories_burned || 0),
                    totalSets: acc.totalSets + (exercise.sets || 0),
                    totalReps: acc.totalReps + (exercise.reps || 0),
                }); }, { totalExercises: 0, totalDuration: 0, totalCalories: 0, totalSets: 0, totalReps: 0 });
                return [2 /*return*/, new Response(JSON.stringify({ exercises: data, totals: totals }), { headers: __assign(__assign({}, corsHeaders), { 'Content-Type': 'application/json' }) })];
            case 4:
                if (!(method === 'POST' && url.pathname === '/exercises')) return [3 /*break*/, 7];
                return [4 /*yield*/, req.json()];
            case 5:
                body = _f.sent();
                caloriesBurned = 0;
                duration = body.duration || 0;
                weight = body.weight || 0;
                switch (body.type) {
                    case 'cardio':
                        caloriesBurned = duration * 8; // ~8 kcal/min
                        break;
                    case 'fuerza':
                        caloriesBurned = duration * 6; // ~6 kcal/min
                        break;
                    case 'resistencia':
                        caloriesBurned = duration * 7; // ~7 kcal/min
                        break;
                    case 'flexibilidad':
                        caloriesBurned = duration * 3; // ~3 kcal/min
                        break;
                    default:
                        caloriesBurned = duration * 5; // ~5 kcal/min promedio
                }
                return [4 /*yield*/, supabaseClient
                        .from('exercises')
                        .insert({
                        user_id: user.id,
                        name: body.name,
                        type: body.type,
                        duration: duration,
                        weight: weight,
                        reps: body.reps || null,
                        sets: body.sets || null,
                        calories_burned: Math.round(caloriesBurned),
                        notes: body.notes || null,
                        created_at: new Date().toISOString(),
                    })
                        .select()
                        .single()];
            case 6:
                _b = _f.sent(), data = _b.data, error = _b.error;
                if (error)
                    throw error;
                return [2 /*return*/, new Response(JSON.stringify({ exercise: data }), { headers: __assign(__assign({}, corsHeaders), { 'Content-Type': 'application/json' }) })];
            case 7:
                if (!(method === 'DELETE' && url.pathname.startsWith('/exercises/'))) return [3 /*break*/, 9];
                exerciseId = url.pathname.split('/')[2];
                return [4 /*yield*/, supabaseClient
                        .from('exercises')
                        .delete()
                        .eq('id', exerciseId)
                        .eq('user_id', user.id)];
            case 8:
                error = (_f.sent()).error;
                if (error)
                    throw error;
                return [2 /*return*/, new Response(JSON.stringify({ success: true }), { headers: __assign(__assign({}, corsHeaders), { 'Content-Type': 'application/json' }) })];
            case 9:
                if (!(method === 'POST' && url.pathname === '/exercises/templates')) return [3 /*break*/, 11];
                return [4 /*yield*/, req.json()];
            case 10:
                query_1 = (_f.sent()).query;
                exerciseDatabase = [
                    // Cardio
                    { name: 'Correr', type: 'cardio', category: 'Cardio', calories_per_min: 10 },
                    { name: 'Caminar rápido', type: 'cardio', category: 'Cardio', calories_per_min: 6 },
                    { name: 'Ciclismo', type: 'cardio', category: 'Cardio', calories_per_min: 8 },
                    { name: 'Natación', type: 'cardio', category: 'Cardio', calories_per_min: 12 },
                    { name: 'Elíptica', type: 'cardio', category: 'Cardio', calories_per_min: 9 },
                    { name: 'Cinta de correr', type: 'cardio', category: 'Cardio', calories_per_min: 10 },
                    { name: 'Saltar cuerda', type: 'cardio', category: 'Cardio', calories_per_min: 11 },
                    // Fuerza - Pecho
                    { name: 'Press de banca', type: 'fuerza', category: 'Pecho', calories_per_min: 6 },
                    { name: 'Flexiones', type: 'fuerza', category: 'Pecho', calories_per_min: 5 },
                    { name: 'Press inclinado', type: 'fuerza', category: 'Pecho', calories_per_min: 6 },
                    { name: 'Aperturas con mancuernas', type: 'fuerza', category: 'Pecho', calories_per_min: 5 },
                    // Fuerza - Espalda
                    { name: 'Dominadas', type: 'fuerza', category: 'Espalda', calories_per_min: 7 },
                    { name: 'Remo con barra', type: 'fuerza', category: 'Espalda', calories_per_min: 6 },
                    { name: 'Pulldown lat', type: 'fuerza', category: 'Espalda', calories_per_min: 6 },
                    { name: 'Remo con mancuerna', type: 'fuerza', category: 'Espalda', calories_per_min: 5 },
                    // Fuerza - Piernas
                    { name: 'Sentadillas', type: 'fuerza', category: 'Piernas', calories_per_min: 7 },
                    { name: 'Peso muerto', type: 'fuerza', category: 'Piernas', calories_per_min: 8 },
                    { name: 'Prensa de piernas', type: 'fuerza', category: 'Piernas', calories_per_min: 6 },
                    { name: 'Extensiones de cuádriceps', type: 'fuerza', category: 'Piernas', calories_per_min: 4 },
                    { name: 'Curl femoral', type: 'fuerza', category: 'Piernas', calories_per_min: 4 },
                    { name: 'Elevaciones de gemelos', type: 'fuerza', category: 'Piernas', calories_per_min: 3 },
                    // Fuerza - Hombros
                    { name: 'Press militar', type: 'fuerza', category: 'Hombros', calories_per_min: 6 },
                    { name: 'Elevaciones laterales', type: 'fuerza', category: 'Hombros', calories_per_min: 4 },
                    { name: 'Elevaciones frontales', type: 'fuerza', category: 'Hombros', calories_per_min: 4 },
                    { name: 'Pájaros', type: 'fuerza', category: 'Hombros', calories_per_min: 4 },
                    // Fuerza - Brazos
                    { name: 'Curl de bíceps', type: 'fuerza', category: 'Brazos', calories_per_min: 4 },
                    { name: 'Tríceps en polea', type: 'fuerza', category: 'Brazos', calories_per_min: 4 },
                    { name: 'Curl martillo', type: 'fuerza', category: 'Brazos', calories_per_min: 4 },
                    { name: 'Fondos en paralelas', type: 'fuerza', category: 'Brazos', calories_per_min: 6 },
                    // Resistencia
                    { name: 'Burpees', type: 'resistencia', category: 'Funcional', calories_per_min: 12 },
                    { name: 'Mountain climbers', type: 'resistencia', category: 'Funcional', calories_per_min: 10 },
                    { name: 'Jumping jacks', type: 'resistencia', category: 'Funcional', calories_per_min: 8 },
                    { name: 'Plancha', type: 'resistencia', category: 'Core', calories_per_min: 5 },
                    { name: 'Abdominales', type: 'resistencia', category: 'Core', calories_per_min: 4 },
                    // Flexibilidad
                    { name: 'Yoga', type: 'flexibilidad', category: 'Flexibilidad', calories_per_min: 3 },
                    { name: 'Estiramientos', type: 'flexibilidad', category: 'Flexibilidad', calories_per_min: 2 },
                    { name: 'Pilates', type: 'flexibilidad', category: 'Flexibilidad', calories_per_min: 4 },
                    { name: 'Tai Chi', type: 'flexibilidad', category: 'Flexibilidad', calories_per_min: 3 },
                ];
                results = exerciseDatabase.filter(function (exercise) {
                    return exercise.name.toLowerCase().includes(query_1.toLowerCase()) ||
                        exercise.category.toLowerCase().includes(query_1.toLowerCase()) ||
                        exercise.type.toLowerCase().includes(query_1.toLowerCase());
                }).slice(0, 10);
                return [2 /*return*/, new Response(JSON.stringify({ results: results }), { headers: __assign(__assign({}, corsHeaders), { 'Content-Type': 'application/json' }) })];
            case 11:
                if (!(method === 'GET' && url.pathname === '/exercises/stats')) return [3 /*break*/, 13];
                return [4 /*yield*/, supabaseClient
                        .from('exercises')
                        .select('*')
                        .eq('user_id', user.id)];
            case 12:
                _c = _f.sent(), data = _c.data, error = _c.error;
                if (error)
                    throw error;
                stats = {
                    totalExercises: data.length,
                    totalDuration: data.reduce(function (acc, ex) { return acc + (ex.duration || 0); }, 0),
                    totalCalories: data.reduce(function (acc, ex) { return acc + (ex.calories_burned || 0); }, 0),
                    averageDuration: data.length > 0 ? Math.round(data.reduce(function (acc, ex) { return acc + (ex.duration || 0); }, 0) / data.length) : 0,
                    favoriteType: data.length > 0 ? getMostFrequent(data.map(function (ex) { return ex.type; })) : null,
                    activeDays: new Set(data.map(function (ex) { var _a; return (_a = ex.created_at) === null || _a === void 0 ? void 0 : _a.split('T')[0]; })).size,
                };
                return [2 /*return*/, new Response(JSON.stringify({ stats: stats }), { headers: __assign(__assign({}, corsHeaders), { 'Content-Type': 'application/json' }) })];
            case 13: return [2 /*return*/, new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: __assign(__assign({}, corsHeaders), { 'Content-Type': 'application/json' }) })];
            case 14:
                error_1 = _f.sent();
                return [2 /*return*/, new Response(JSON.stringify({ error: error_1.message }), { status: 500, headers: __assign(__assign({}, corsHeaders), { 'Content-Type': 'application/json' }) })];
            case 15: return [2 /*return*/];
        }
    });
}); });
// Función auxiliar para encontrar el tipo más frecuente
function getMostFrequent(arr) {
    if (arr.length === 0)
        return null;
    var frequency = {};
    arr.forEach(function (item) {
        frequency[item] = (frequency[item] || 0) + 1;
    });
    return Object.keys(frequency).reduce(function (a, b) { return frequency[a] > frequency[b] ? a : b; });
}
