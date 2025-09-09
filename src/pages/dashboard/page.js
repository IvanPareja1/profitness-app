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
exports.default = Dashboard;
var react_1 = require("react");
var react_router_dom_1 = require("react-router-dom");
var useAuth_1 = require("../../hooks/useAuth");
function Dashboard() {
    var _this = this;
    var _a = (0, react_1.useState)(new Date().toISOString().split('T')[0]), selectedDate = _a[0], setSelectedDate = _a[1];
    var _b = (0, react_1.useState)({ calories: 0, carbs: 0, protein: 0, fat: 0 }), dayTotals = _b[0], setDayTotals = _b[1];
    var _c = (0, react_1.useState)([]), recentMeals = _c[0], setRecentMeals = _c[1];
    var _d = (0, react_1.useState)({ totalDuration: 0, totalCalories: 0, totalExercises: 0 }), exerciseStats = _d[0], setExerciseStats = _d[1];
    var _e = (0, react_1.useState)({ daily_calories: 2200, daily_exercise_minutes: 60, is_rest_day: false }), todayGoals = _e[0], setTodayGoals = _e[1];
    var _f = (0, react_1.useState)(false), loading = _f[0], setLoading = _f[1];
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
                            throw new Error("HTTP error! status: ".concat(response.status));
                        }
                        return [2 /*return*/, response.json()];
                }
            });
        });
    };
    var loadDashboardData = function () { return __awaiter(_this, void 0, void 0, function () {
        var goalsData, mealsData, exercisesData, error_1;
        var _a, _b, _c, _d, _e, _f, _g, _h;
        return __generator(this, function (_j) {
            switch (_j.label) {
                case 0:
                    _j.trys.push([0, 5, 6, 7]);
                    setLoading(true);
                    return [4 /*yield*/, callSupabaseFunction("goals/today?date=".concat(selectedDate))];
                case 1:
                    goalsData = _j.sent();
                    setTodayGoals({
                        daily_calories: goalsData.goals.daily_calories,
                        daily_exercise_minutes: goalsData.goals.daily_exercise_minutes,
                        is_rest_day: goalsData.goals.is_rest_day
                    });
                    return [4 /*yield*/, callSupabaseFunction("meals?date=".concat(selectedDate))];
                case 2:
                    mealsData = _j.sent();
                    setDayTotals(mealsData.totals || { calories: 0, carbs: 0, protein: 0, fat: 0 });
                    setRecentMeals((mealsData.meals || []).slice(0, 3));
                    return [4 /*yield*/, callSupabaseFunction("exercises?date=".concat(selectedDate))];
                case 3:
                    exercisesData = _j.sent();
                    setExerciseStats({
                        totalDuration: ((_a = exercisesData.totals) === null || _a === void 0 ? void 0 : _a.totalDuration) || 0,
                        totalCalories: ((_b = exercisesData.totals) === null || _b === void 0 ? void 0 : _b.totalCalories) || 0,
                        totalExercises: ((_c = exercisesData.totals) === null || _c === void 0 ? void 0 : _c.totalExercises) || 0
                    });
                    // Actualizar logros del día
                    return [4 /*yield*/, callSupabaseFunction('goals/achievement', {
                            method: 'PUT',
                            body: {
                                date: selectedDate,
                                calories_achieved: ((_d = mealsData.totals) === null || _d === void 0 ? void 0 : _d.calories) || 0,
                                protein_achieved: ((_e = mealsData.totals) === null || _e === void 0 ? void 0 : _e.protein) || 0,
                                carbs_achieved: ((_f = mealsData.totals) === null || _f === void 0 ? void 0 : _f.carbs) || 0,
                                fat_achieved: ((_g = mealsData.totals) === null || _g === void 0 ? void 0 : _g.fat) || 0,
                                exercise_achieved: ((_h = exercisesData.totals) === null || _h === void 0 ? void 0 : _h.totalDuration) || 0,
                                water_achieved: 0, // TODO: Implementar tracking de agua
                                streak_maintained: true // TODO: Lógica de racha
                            }
                        })];
                case 4:
                    // Actualizar logros del día
                    _j.sent();
                    return [3 /*break*/, 7];
                case 5:
                    error_1 = _j.sent();
                    console.error('Error loading dashboard data:', error_1);
                    return [3 /*break*/, 7];
                case 6:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    (0, react_1.useEffect)(function () {
        if (user) {
            loadDashboardData();
        }
    }, [selectedDate, user]);
    var calorieProgress = Math.min((dayTotals.calories / todayGoals.daily_calories) * 100, 100);
    var exerciseProgress = Math.min((exerciseStats.totalDuration / todayGoals.daily_exercise_minutes) * 100, 100);
    var getMealTypeIcon = function (mealTime) {
        var hour = new Date(mealTime).getHours();
        if (hour >= 5 && hour < 12)
            return 'ri-sun-line';
        if (hour >= 12 && hour < 17)
            return 'ri-sun-fill';
        return 'ri-moon-line';
    };
    var getMealTypeName = function (mealTime) {
        var hour = new Date(mealTime).getHours();
        if (hour >= 5 && hour < 12)
            return 'Desayuno';
        if (hour >= 12 && hour < 17)
            return 'Almuerzo';
        return 'Cena';
    };
    return (<div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 pb-20">
      {/* Header */}
      <div className="fixed top-0 w-full bg-white/90 backdrop-blur-md shadow-sm z-50">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-gray-800" style={{ fontFamily: 'Pacifico, serif' }}>ProFitness</h1>
              <p className="text-xs text-gray-600">Tu progreso diario</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
              <i className="ri-user-line text-white text-lg"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="pt-20 px-4">
        {/* Date Selector */}
        <div className="mb-6">
          <input type="date" value={selectedDate} onChange={function (e) { return setSelectedDate(e.target.value); }} className="w-full p-3 bg-white rounded-xl shadow-sm border-none text-gray-700"/>
        </div>

        {loading ? (<div className="text-center py-8">
            <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-gray-500">Cargando estadísticas...</p>
          </div>) : (<>
            {/* Progress Cards */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <i className="ri-restaurant-line text-green-600"></i>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="text-xs text-gray-500">Calorías</span>
                    {todayGoals.is_rest_day && (<div className="w-2 h-2 bg-purple-400 rounded-full" title="Día de descanso - Meta ajustada"></div>)}
                  </div>
                </div>
                <div className="mb-2">
                  <div className="text-lg font-bold text-gray-800">{dayTotals.calories.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">
                    de {todayGoals.daily_calories.toLocaleString()} kcal
                    {todayGoals.is_rest_day && <span className="text-purple-600 ml-1">(ajustado)</span>}
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full transition-all duration-300" style={{ width: "".concat(calorieProgress, "%") }}></div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <i className="ri-run-line text-blue-600"></i>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="text-xs text-gray-500">Ejercicio</span>
                    {todayGoals.is_rest_day && (<div className="w-2 h-2 bg-purple-400 rounded-full" title="Día de descanso - Meta ajustada"></div>)}
                  </div>
                </div>
                <div className="mb-2">
                  <div className="text-lg font-bold text-gray-800">{exerciseStats.totalDuration}</div>
                  <div className="text-xs text-gray-500">
                    de {todayGoals.daily_exercise_minutes} min
                    {todayGoals.is_rest_day && <span className="text-purple-600 ml-1">(descanso)</span>}
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className={"h-2 rounded-full transition-all duration-300 ".concat(todayGoals.is_rest_day ? 'bg-purple-400' : 'bg-blue-500')} style={{ width: "".concat(exerciseProgress, "%") }}></div>
                </div>
              </div>
            </div>

            {/* Rest Day Indicator */}
            {todayGoals.is_rest_day && (<div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <i className="ri-calendar-check-line text-purple-600"></i>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-purple-800 text-sm">Día de descanso</div>
                    <div className="text-xs text-purple-600 mt-1">
                      Tus metas se han ajustado automáticamente. Enfócate en la recuperación.
                    </div>
                  </div>
                  <button onClick={function () { return navigate('/goals'); }} className="text-purple-600 text-xs font-medium">
                    Configurar
                  </button>
                </div>
              </div>)}

            {/* Stats Overview */}
            <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
              <h3 className="font-semibold text-gray-800 mb-4">Resumen del día</h3>
              <div className="grid grid-cols-4 gap-3">
                <div className="text-center">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <i className="ri-fire-line text-orange-600 text-sm"></i>
                  </div>
                  <div className="text-sm font-semibold text-gray-800">{exerciseStats.totalCalories}</div>
                  <div className="text-xs text-gray-500">kcal quemadas</div>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <i className="ri-trophy-line text-purple-600 text-sm"></i>
                  </div>
                  <div className="text-sm font-semibold text-gray-800">{exerciseStats.totalExercises}</div>
                  <div className="text-xs text-gray-500">ejercicios</div>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <i className="ri-restaurant-line text-green-600 text-sm"></i>
                  </div>
                  <div className="text-sm font-semibold text-gray-800">{recentMeals.length}</div>
                  <div className="text-xs text-gray-500">comidas</div>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <i className="ri-heart-pulse-line text-blue-600 text-sm"></i>
                  </div>
                  <div className="text-sm font-semibold text-gray-800">{Math.round(calorieProgress)}%</div>
                  <div className="text-xs text-gray-500">objetivo</div>
                </div>
              </div>
            </div>

            {/* Macros */}
            <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
              <h3 className="font-semibold text-gray-800 mb-4">Macronutrientes</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-red-600 font-bold text-sm">C</span>
                  </div>
                  <div className="text-sm font-semibold text-gray-800">{dayTotals.carbs.toFixed(1)}g</div>
                  <div className="text-xs text-gray-500">Carbohidratos</div>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-yellow-600 font-bold text-sm">P</span>
                  </div>
                  <div className="text-sm font-semibold text-gray-800">{dayTotals.protein.toFixed(1)}g</div>
                  <div className="text-xs text-gray-500">Proteínas</div>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-purple-600 font-bold text-sm">G</span>
                  </div>
                  <div className="text-sm font-semibold text-gray-800">{dayTotals.fat.toFixed(1)}g</div>
                  <div className="text-xs text-gray-500">Grasas</div>
                </div>
              </div>
            </div>

            {/* Recent Meals */}
            <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">Comidas de hoy</h3>
                <button onClick={function () { return navigate('/nutrition'); }} className="text-green-600 text-sm font-medium">
                  Ver todas
                </button>
              </div>
              
              {recentMeals.length === 0 ? (<div className="text-center py-6">
                  <i className="ri-restaurant-line text-3xl text-gray-300 mb-2"></i>
                  <p className="text-gray-500 text-sm">No hay comidas registradas</p>
                  <button onClick={function () { return navigate('/nutrition'); }} className="text-green-600 text-sm font-medium mt-2">
                    Añadir primera comida
                  </button>
                </div>) : (<div className="space-y-3">
                  {recentMeals.map(function (meal) { return (<div key={meal.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-blue-100 rounded-lg flex items-center justify-center">
                          <i className={"".concat(getMealTypeIcon(meal.created_at), " text-green-600")}></i>
                        </div>
                        <div>
                          <div className="font-medium text-gray-800 text-sm">{meal.name}</div>
                          <div className="text-xs text-gray-500">
                            {getMealTypeName(meal.created_at)} • {new Date(meal.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm font-semibold text-gray-800">{meal.calories} kcal</div>
                    </div>); })}
                </div>)}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4">
              <button onClick={function () { return navigate('/nutrition'); }} className="bg-gradient-to-r from-green-400 to-green-5    00 text-white p-4 rounded-xl shadow-sm flex items-center justify-center space-x-2">
                <i className="ri-add-line text-lg"></i>
                <span className="font-medium">Añadir comida</span>
              </button>
              <button onClick={function () { return navigate('/exercise'); }} className="bg-gradient-to-r from-blue-400 to-blue-500 text-white p-4 rounded-xl shadow-sm flex items-center justify-center space-x-2">
                <i className="ri-play-line text-lg"></i>
                <span className="font-medium">Nuevo ejercicio</span>
              </button>
            </div>
          </>)}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 w-full bg-white shadow-lg">
        <div className="grid grid-cols-4 h-16">
          <button className="flex flex-col items-center justify-center space-y-1 bg-green-50">
            <div className="w-6 h-6 flex items-center justify-center">
              <i className="ri-dashboard-3-fill text-green-600 text-lg"></i>
            </div>
            <span className="text-xs text-green-600 font-medium">Dashboard</span>
          </button>
          <button onClick={function () { return navigate('/nutrition'); }} className="flex flex-col items-center justify-center space-y-1">
            <div className="w-6 h-6 flex items-center justify-center">
              <i className="ri-restaurant-line text-gray-400 text-lg"></i>
            </div>
            <span className="text-xs text-gray-400">Nutrición</span>
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
