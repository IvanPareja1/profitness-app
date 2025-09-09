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
    var supabaseClient, user, url, startDate, endDate, _a, achievements, error, weeks, startDateObj, endDateObj, currentWeekStart_1, dayOfWeek, daysToMonday, _loop_1, error_1;
    var _b, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                if (req.method === 'OPTIONS') {
                    return [2 /*return*/, new Response('ok', { headers: corsHeaders })];
                }
                _d.label = 1;
            case 1:
                _d.trys.push([1, 4, , 5]);
                supabaseClient = (0, supabase_js_2_1.createClient)((_b = Deno.env.get('SUPABASE_URL')) !== null && _b !== void 0 ? _b : '', (_c = Deno.env.get('SUPABASE_ANON_KEY')) !== null && _c !== void 0 ? _c : '', {
                    global: {
                        headers: { Authorization: req.headers.get('Authorization') },
                    },
                });
                return [4 /*yield*/, supabaseClient.auth.getUser()];
            case 2:
                user = (_d.sent()).data.user;
                if (!user) {
                    return [2 /*return*/, new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: __assign(__assign({}, corsHeaders), { 'Content-Type': 'application/json' }) })];
                }
                url = new URL(req.url);
                startDate = url.searchParams.get('start_date');
                endDate = url.searchParams.get('end_date');
                if (!startDate || !endDate) {
                    return [2 /*return*/, new Response(JSON.stringify({ error: 'Missing start_date or end_date parameters' }), { status: 400, headers: __assign(__assign({}, corsHeaders), { 'Content-Type': 'application/json' }) })];
                }
                return [4 /*yield*/, supabaseClient
                        .from('daily_achievements')
                        .select('*')
                        .eq('user_id', user.id)
                        .gte('date', startDate)
                        .lte('date', endDate)
                        .order('date', { ascending: true })];
            case 3:
                _a = _d.sent(), achievements = _a.data, error = _a.error;
                if (error)
                    throw error;
                weeks = [];
                startDateObj = new Date(startDate);
                endDateObj = new Date(endDate);
                currentWeekStart_1 = new Date(startDateObj);
                dayOfWeek = currentWeekStart_1.getDay();
                daysToMonday = (dayOfWeek === 0 ? 6 : dayOfWeek - 1);
                currentWeekStart_1.setDate(currentWeekStart_1.getDate() - daysToMonday);
                _loop_1 = function () {
                    var weekEnd = new Date(currentWeekStart_1);
                    weekEnd.setDate(weekEnd.getDate() + 6);
                    var weekAchievements = achievements.filter(function (a) {
                        var achievementDate = new Date(a.date);
                        return achievementDate >= currentWeekStart_1 && achievementDate <= weekEnd;
                    });
                    if (weekAchievements.length > 0) {
                        var activeDays = weekAchievements.filter(function (a) { return !a.is_rest_day; }).length;
                        var restDays = weekAchievements.filter(function (a) { return a.is_rest_day; }).length;
                        var streakDays = weekAchievements.filter(function (a) { return a.streak_maintained; }).length;
                        var avgCaloriesCompletion = Math.round(weekAchievements.reduce(function (sum, a) {
                            var completion = a.calories_goal > 0 ? (a.calories_achieved / a.calories_goal) * 100 : 0;
                            return sum + Math.min(completion, 100);
                        }, 0) / weekAchievements.length);
                        var avgExerciseCompletion = Math.round(weekAchievements.reduce(function (sum, a) {
                            var completion = a.exercise_goal > 0 ? (a.exercise_achieved / a.exercise_goal) * 100 : 0;
                            return sum + Math.min(completion, 100);
                        }, 0) / weekAchievements.length);
                        weeks.push({
                            week_start: currentWeekStart_1.toISOString().split('T')[0],
                            week_end: weekEnd.toISOString().split('T')[0],
                            active_days: activeDays,
                            rest_days: restDays,
                            streak_days: streakDays,
                            avg_calories_completion: avgCaloriesCompletion,
                            avg_exercise_completion: avgExerciseCompletion,
                            total_days: weekAchievements.length
                        });
                    }
                    currentWeekStart_1.setDate(currentWeekStart_1.getDate() + 7);
                };
                while (currentWeekStart_1 <= endDateObj) {
                    _loop_1();
                }
                return [2 /*return*/, new Response(JSON.stringify({ weeks: weeks }), { headers: __assign(__assign({}, corsHeaders), { 'Content-Type': 'application/json' }) })];
            case 4:
                error_1 = _d.sent();
                return [2 /*return*/, new Response(JSON.stringify({ error: error_1.message }), { status: 500, headers: __assign(__assign({}, corsHeaders), { 'Content-Type': 'application/json' }) })];
            case 5: return [2 /*return*/];
        }
    });
}); });
