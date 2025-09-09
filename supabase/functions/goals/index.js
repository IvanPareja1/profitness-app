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
    var supabaseClient, user, url, method, _a, data, error, _b, newGoals, createError, body, _c, data, error, date, dayOfWeek, dayNames, currentDay, _d, goals, goalsError, isRestDay, adjustedGoals, _e, achievement, achievementError, _f, newAchievement, createError, startDate, endDate, _g, achievements, error, totalDays, restDays, activeDays, stats, body, date, _h, data, error, error_1;
    var _j, _k;
    return __generator(this, function (_l) {
        switch (_l.label) {
            case 0:
                if (req.method === 'OPTIONS') {
                    return [2 /*return*/, new Response('ok', { headers: corsHeaders })];
                }
                _l.label = 1;
            case 1:
                _l.trys.push([1, 20, , 21]);
                supabaseClient = (0, supabase_js_2_1.createClient)((_j = Deno.env.get('SUPABASE_URL')) !== null && _j !== void 0 ? _j : '', (_k = Deno.env.get('SUPABASE_ANON_KEY')) !== null && _k !== void 0 ? _k : '', {
                    global: {
                        headers: { Authorization: req.headers.get('Authorization') },
                    },
                });
                return [4 /*yield*/, supabaseClient.auth.getUser()];
            case 2:
                user = (_l.sent()).data.user;
                if (!user) {
                    return [2 /*return*/, new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: __assign(__assign({}, corsHeaders), { 'Content-Type': 'application/json' }) })];
                }
                url = new URL(req.url);
                method = req.method;
                if (!(method === 'GET' && url.pathname === '/goals')) return [3 /*break*/, 6];
                return [4 /*yield*/, supabaseClient
                        .from('user_goals')
                        .select('*')
                        .eq('user_id', user.id)
                        .single()];
            case 3:
                _a = _l.sent(), data = _a.data, error = _a.error;
                if (error && error.code !== 'PGRST116') {
                    throw error;
                }
                if (!!data) return [3 /*break*/, 5];
                return [4 /*yield*/, supabaseClient
                        .from('user_goals')
                        .insert({
                        user_id: user.id,
                        daily_calories: 2200,
                        daily_protein: 100,
                        daily_carbs: 275,
                        daily_fat: 73,
                        daily_exercise_minutes: 60,
                        daily_water_glasses: 8,
                        weekly_exercise_days: 5,
                        rest_days: [],
                        auto_adjust_rest_days: true
                    })
                        .select()
                        .single()];
            case 4:
                _b = _l.sent(), newGoals = _b.data, createError = _b.error;
                if (createError)
                    throw createError;
                return [2 /*return*/, new Response(JSON.stringify({ goals: newGoals }), { headers: __assign(__assign({}, corsHeaders), { 'Content-Type': 'application/json' }) })];
            case 5: return [2 /*return*/, new Response(JSON.stringify({ goals: data }), { headers: __assign(__assign({}, corsHeaders), { 'Content-Type': 'application/json' }) })];
            case 6:
                if (!(method === 'PUT' && url.pathname === '/goals')) return [3 /*break*/, 9];
                return [4 /*yield*/, req.json()];
            case 7:
                body = _l.sent();
                return [4 /*yield*/, supabaseClient
                        .from('user_goals')
                        .upsert({
                        user_id: user.id,
                        daily_calories: body.daily_calories,
                        daily_protein: body.daily_protein,
                        daily_carbs: body.daily_carbs,
                        daily_fat: body.daily_fat,
                        daily_exercise_minutes: body.daily_exercise_minutes,
                        daily_water_glasses: body.daily_water_glasses,
                        weekly_exercise_days: body.weekly_exercise_days,
                        rest_days: body.rest_days,
                        auto_adjust_rest_days: body.auto_adjust_rest_days,
                        updated_at: new Date().toISOString()
                    })
                        .select()
                        .single()];
            case 8:
                _c = _l.sent(), data = _c.data, error = _c.error;
                if (error)
                    throw error;
                return [2 /*return*/, new Response(JSON.stringify({ goals: data }), { headers: __assign(__assign({}, corsHeaders), { 'Content-Type': 'application/json' }) })];
            case 9:
                if (!(method === 'GET' && url.pathname === '/goals/today')) return [3 /*break*/, 14];
                date = url.searchParams.get('date') || new Date().toISOString().split('T')[0];
                dayOfWeek = new Date(date).getDay();
                dayNames = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
                currentDay = dayNames[dayOfWeek];
                return [4 /*yield*/, supabaseClient
                        .from('user_goals')
                        .select('*')
                        .eq('user_id', user.id)
                        .single()];
            case 10:
                _d = _l.sent(), goals = _d.data, goalsError = _d.error;
                if (goalsError)
                    throw goalsError;
                isRestDay = goals.rest_days.includes(currentDay);
                adjustedGoals = {
                    daily_calories: goals.daily_calories,
                    daily_protein: goals.daily_protein,
                    daily_carbs: goals.daily_carbs,
                    daily_fat: goals.daily_fat,
                    daily_exercise_minutes: goals.daily_exercise_minutes,
                    daily_water_glasses: goals.daily_water_glasses,
                    is_rest_day: isRestDay
                };
                // Si es día de descanso y tiene auto-ajuste activado
                if (isRestDay && goals.auto_adjust_rest_days) {
                    // Reducir metas de ejercicio pero mantener nutrición
                    adjustedGoals.daily_exercise_minutes = Math.round(goals.daily_exercise_minutes * 0.3); // 30% del ejercicio normal
                    adjustedGoals.daily_calories = Math.round(goals.daily_calories * 0.9); // 90% de las calorías
                }
                return [4 /*yield*/, supabaseClient
                        .from('daily_achievements')
                        .select('*')
                        .eq('user_id', user.id)
                        .eq('date', date)
                        .single()];
            case 11:
                _e = _l.sent(), achievement = _e.data, achievementError = _e.error;
                if (achievementError && achievementError.code !== 'PGRST116') {
                    throw achievementError;
                }
                if (!!achievement) return [3 /*break*/, 13];
                return [4 /*yield*/, supabaseClient
                        .from('daily_achievements')
                        .insert({
                        user_id: user.id,
                        date: date,
                        calories_goal: adjustedGoals.daily_calories,
                        protein_goal: adjustedGoals.daily_protein,
                        carbs_goal: adjustedGoals.daily_carbs,
                        fat_goal: adjustedGoals.daily_fat,
                        exercise_goal: adjustedGoals.daily_exercise_minutes,
                        water_goal: adjustedGoals.daily_water_glasses,
                        is_rest_day: isRestDay
                    })
                        .select()
                        .single()];
            case 12:
                _f = _l.sent(), newAchievement = _f.data, createError = _f.error;
                if (createError)
                    throw createError;
                return [2 /*return*/, new Response(JSON.stringify({
                        goals: adjustedGoals,
                        achievement: newAchievement,
                        original_goals: goals
                    }), { headers: __assign(__assign({}, corsHeaders), { 'Content-Type': 'application/json' }) })];
            case 13: return [2 /*return*/, new Response(JSON.stringify({
                    goals: adjustedGoals,
                    achievement: achievement,
                    original_goals: goals
                }), { headers: __assign(__assign({}, corsHeaders), { 'Content-Type': 'application/json' }) })];
            case 14:
                if (!(method === 'GET' && url.pathname === '/goals/progress')) return [3 /*break*/, 16];
                startDate = url.searchParams.get('start_date');
                endDate = url.searchParams.get('end_date');
                return [4 /*yield*/, supabaseClient
                        .from('daily_achievements')
                        .select('*')
                        .eq('user_id', user.id)
                        .gte('date', startDate)
                        .lte('date', endDate)
                        .order('date', { ascending: true })];
            case 15:
                _g = _l.sent(), achievements = _g.data, error = _g.error;
                if (error)
                    throw error;
                totalDays = achievements.length;
                restDays = achievements.filter(function (a) { return a.is_rest_day; }).length;
                activeDays = totalDays - restDays;
                stats = {
                    total_days: totalDays,
                    active_days: activeDays,
                    rest_days: restDays,
                    calories_avg_completion: 0,
                    exercise_avg_completion: 0,
                    streak_maintained: 0
                };
                if (totalDays > 0) {
                    stats.calories_avg_completion = Math.round(achievements.reduce(function (sum, a) {
                        var completion = a.calories_goal > 0 ? (a.calories_achieved / a.calories_goal) * 100 : 0;
                        return sum + Math.min(completion, 100);
                    }, 0) / totalDays);
                    stats.exercise_avg_completion = Math.round(achievements.reduce(function (sum, a) {
                        var completion = a.exercise_goal > 0 ? (a.exercise_achieved / a.exercise_goal) * 100 : 0;
                        return sum + Math.min(completion, 100);
                    }, 0) / totalDays);
                    stats.streak_maintained = achievements.filter(function (a) { return a.streak_maintained; }).length;
                }
                return [2 /*return*/, new Response(JSON.stringify({ achievements: achievements, stats: stats }), { headers: __assign(__assign({}, corsHeaders), { 'Content-Type': 'application/json' }) })];
            case 16:
                if (!(method === 'PUT' && url.pathname === '/goals/achievement')) return [3 /*break*/, 19];
                return [4 /*yield*/, req.json()];
            case 17:
                body = _l.sent();
                date = body.date || new Date().toISOString().split('T')[0];
                return [4 /*yield*/, supabaseClient
                        .from('daily_achievements')
                        .upsert({
                        user_id: user.id,
                        date: date,
                        calories_achieved: body.calories_achieved,
                        protein_achieved: body.protein_achieved,
                        carbs_achieved: body.carbs_achieved,
                        fat_achieved: body.fat_achieved,
                        exercise_achieved: body.exercise_achieved,
                        water_achieved: body.water_achieved,
                        streak_maintained: body.streak_maintained
                    })
                        .select()
                        .single()];
            case 18:
                _h = _l.sent(), data = _h.data, error = _h.error;
                if (error)
                    throw error;
                return [2 /*return*/, new Response(JSON.stringify({ achievement: data }), { headers: __assign(__assign({}, corsHeaders), { 'Content-Type': 'application/json' }) })];
            case 19: return [2 /*return*/, new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: __assign(__assign({}, corsHeaders), { 'Content-Type': 'application/json' }) })];
            case 20:
                error_1 = _l.sent();
                return [2 /*return*/, new Response(JSON.stringify({ error: error_1.message }), { status: 500, headers: __assign(__assign({}, corsHeaders), { 'Content-Type': 'application/json' }) })];
            case 21: return [2 /*return*/];
        }
    });
}); });
