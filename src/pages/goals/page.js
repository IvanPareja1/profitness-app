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
exports.default = Goals;
var react_1 = require("react");
var react_router_dom_1 = require("react-router-dom");
var useAuth_1 = require("../../hooks/useAuth");
function Goals() {
    var _this = this;
    var _a = (0, react_1.useState)(null), goals = _a[0], setGoals = _a[1];
    var _b = (0, react_1.useState)(null), originalGoals = _b[0], setOriginalGoals = _b[1];
    var _c = (0, react_1.useState)(null), progressStats = _c[0], setProgressStats = _c[1];
    var _d = (0, react_1.useState)(true), loading = _d[0], setLoading = _d[1];
    var _e = (0, react_1.useState)(false), saving = _e[0], setSaving = _e[1];
    var _f = (0, react_1.useState)('goals'), activeTab = _f[0], setActiveTab = _f[1];
    var _g = (0, react_1.useState)([]), selectedRestDays = _g[0], setSelectedRestDays = _g[1];
    var _h = (0, react_1.useState)(false), isEditing = _h[0], setIsEditing = _h[1];
    var navigate = (0, react_router_dom_1.useNavigate)();
    var user = (0, useAuth_1.useAuth)().user;
    var dayNames = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
    var dayLabels = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
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
    var loadGoals = function () { return __awaiter(_this, void 0, void 0, function () {
        var data, today, startOfWeek, endOfWeek, progressData, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, 4, 5]);
                    setLoading(true);
                    return [4 /*yield*/, callSupabaseFunction('goals')];
                case 1:
                    data = _a.sent();
                    setGoals(data.goals);
                    setOriginalGoals(data.goals);
                    setSelectedRestDays(data.goals.rest_days || []);
                    today = new Date();
                    startOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 1));
                    endOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 7));
                    return [4 /*yield*/, callSupabaseFunction("goals/progress?start_date=".concat(startOfWeek.toISOString().split('T')[0], "&end_date=").concat(endOfWeek.toISOString().split('T')[0]))];
                case 2:
                    progressData = _a.sent();
                    setProgressStats(progressData.stats);
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _a.sent();
                    console.error('Error loading goals:', error_1);
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    (0, react_1.useEffect)(function () {
        if (user) {
            loadGoals();
        }
    }, [user]);
    var handleSaveGoals = function () { return __awaiter(_this, void 0, void 0, function () {
        var error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!goals)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    setSaving(true);
                    return [4 /*yield*/, callSupabaseFunction('goals', {
                            method: 'PUT',
                            body: __assign(__assign({}, goals), { rest_days: selectedRestDays })
                        })];
                case 2:
                    _a.sent();
                    setOriginalGoals(__assign(__assign({}, goals), { rest_days: selectedRestDays }));
                    setIsEditing(false);
                    return [3 /*break*/, 5];
                case 3:
                    error_2 = _a.sent();
                    console.error('Error saving goals:', error_2);
                    return [3 /*break*/, 5];
                case 4:
                    setSaving(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var handleRestDayToggle = function (day) {
        setSelectedRestDays(function (prev) {
            return prev.includes(day)
                ? prev.filter(function (d) { return d !== day; })
                : __spreadArray(__spreadArray([], prev, true), [day], false);
        });
    };
    var resetToDefaults = function () {
        setGoals({
            daily_calories: 2200,
            daily_protein: 100,
            daily_carbs: 275,
            daily_fat: 73,
            daily_exercise_minutes: 60,
            daily_water_glasses: 8,
            weekly_exercise_days: 5,
            rest_days: [],
            auto_adjust_rest_days: true
        });
        setSelectedRestDays([]);
    };
    var cancelEdit = function () {
        if (originalGoals) {
            setGoals(originalGoals);
            setSelectedRestDays(originalGoals.rest_days || []);
        }
        setIsEditing(false);
    };
    if (loading) {
        return (<div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-600">Cargando metas...</p>
        </div>
      </div>);
    }
    return (<div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 pb-20">
      {/* Header */}
      <div className="fixed top-0 w-full bg-white/90 backdrop-blur-md shadow-sm z-50">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button onClick={function () { return navigate('/profile'); }} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <i className="ri-arrow-left-line text-gray-600"></i>
              </button>
              <div>
                <h1 className="text-lg font-bold text-gray-800">Mis Metas</h1>
                <p className="text-xs text-gray-600">Personaliza tus objetivos</p>
              </div>
            </div>
            {isEditing && (<div className="flex items-center space-x-2">
                <button onClick={cancelEdit} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm">
                  Cancelar
                </button>
                <button onClick={handleSaveGoals} disabled={saving} className="px-3 py-1 bg-purple-500 text-white rounded-lg text-sm flex items-center space-x-1">
                  {saving ? (<div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>) : (<>
                      <i className="ri-check-line"></i>
                      <span>Guardar</span>
                    </>)}
                </button>
              </div>)}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="pt-20 px-4">
        {/* Tab Switcher */}
        <div className="bg-white rounded-full p-1 mb-6 shadow-sm">
          <div className="grid grid-cols-3">
            <button onClick={function () { return setActiveTab('goals'); }} className={"px-4 py-2 rounded-full text-sm font-medium transition-all ".concat(activeTab === 'goals'
            ? 'bg-purple-500 text-white shadow-sm'
            : 'text-gray-600')}>
              Metas
            </button>
            <button onClick={function () { return setActiveTab('rest'); }} className={"px-4 py-2 rounded-full text-sm font-medium transition-all ".concat(activeTab === 'rest'
            ? 'bg-purple-500 text-white shadow-sm'
            : 'text-gray-600')}>
              Descanso
            </button>
            <button onClick={function () { return setActiveTab('progress'); }} className={"px-4 py-2 rounded-full text-sm font-medium transition-all ".concat(activeTab === 'progress'
            ? 'bg-purple-500 text-white shadow-sm'
            : 'text-gray-600')}>
              Progreso
            </button>
          </div>
        </div>

        {goals && (<>
            {/* Goals Tab */}
            {activeTab === 'goals' && (<div className="space-y-6">
                {/* Action Buttons */}
                {!isEditing && (<div className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={function () { return setIsEditing(true); }} className="bg-gradient-to-r from-purple-400 to-purple-500 text-white py-3 rounded-lg font-medium flex items-center justify-center space-x-2">
                        <i className="ri-edit-line"></i>
                        <span>Editar metas</span>
                      </button>
                      <button onClick={resetToDefaults} className="bg-gray-100 text-gray-700 py-3 rounded-lg font-medium flex items-center justify-center space-x-2">
                        <i className="ri-restart-line"></i>
                        <span>Restaurar</span>
                      </button>
                    </div>
                  </div>)}

                {/* Nutrition Goals */}
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <h3 className="font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                    <i className="ri-restaurant-line text-green-600"></i>
                    <span>Metas de Nutrición</span>
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-800 text-sm">Calorías diarias</div>
                        <div className="text-xs text-gray-500">Meta energética total</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {isEditing ? (<input type="number" value={goals.daily_calories} onChange={function (e) { return setGoals(__assign(__assign({}, goals), { daily_calories: parseInt(e.target.value) || 0 })); }} className="w-20 p-2 bg-gray-50 rounded-lg border-none text-sm text-right"/>) : (<span className="font-bold text-gray-800">{goals.daily_calories}</span>)}
                        <span className="text-sm text-gray-500">kcal</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-red-50 rounded-lg">
                        <div className="text-xs text-red-600 font-medium mb-1">Carbohidratos</div>
                        {isEditing ? (<input type="number" step="0.1" value={goals.daily_carbs} onChange={function (e) { return setGoals(__assign(__assign({}, goals), { daily_carbs: parseFloat(e.target.value) || 0 })); }} className="w-full p-1 bg-white rounded text-sm text-center border-none"/>) : (<div className="font-bold text-red-600">{goals.daily_carbs}g</div>)}
                      </div>
                      <div className="text-center p-3 bg-yellow-50 rounded-lg">
                        <div className="text-xs text-yellow-600 font-medium mb-1">Proteínas</div>
                        {isEditing ? (<input type="number" step="0.1" value={goals.daily_protein} onChange={function (e) { return setGoals(__assign(__assign({}, goals), { daily_protein: parseFloat(e.target.value) || 0 })); }} className="w-full p-1 bg-white rounded text-sm text-center border-none"/>) : (<div className="font-bold text-yellow-600">{goals.daily_protein}g</div>)}
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className="text-xs text-purple-600 font-medium mb-1">Grasas</div>
                        {isEditing ? (<input type="number" step="0.1" value={goals.daily_fat} onChange={function (e) { return setGoals(__assign(__assign({}, goals), { daily_fat: parseFloat(e.target.value) || 0 })); }} className="w-full p-1 bg-white rounded text-sm text-center border-none"/>) : (<div className="font-bold text-purple-600">{goals.daily_fat}g</div>)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Exercise Goals */}
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <h3 className="font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                    <i className="ri-run-line text-blue-600"></i>
                    <span>Metas de Ejercicio</span>
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-800 text-sm">Ejercicio diario</div>
                        <div className="text-xs text-gray-500">Tiempo de actividad física</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {isEditing ? (<input type="number" value={goals.daily_exercise_minutes} onChange={function (e) { return setGoals(__assign(__assign({}, goals), { daily_exercise_minutes: parseInt(e.target.value) || 0 })); }} className="w-20 p-2 bg-gray-50 rounded-lg border-none text-sm text-right"/>) : (<span className="font-bold text-gray-800">{goals.daily_exercise_minutes}</span>)}
                        <span className="text-sm text-gray-500">min</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-800 text-sm">Días activos por semana</div>
                        <div className="text-xs text-gray-500">Días con ejercicio</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {isEditing ? (<input type="number" min="1" max="7" value={goals.weekly_exercise_days} onChange={function (e) { return setGoals(__assign(__assign({}, goals), { weekly_exercise_days: parseInt(e.target.value) || 1 })); }} className="w-16 p-2 bg-gray-50 rounded-lg border-none text-sm text-right"/>) : (<span className="font-bold text-gray-800">{goals.weekly_exercise_days}</span>)}
                        <span className="text-sm text-gray-500">días</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hydration Goals */}
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <h3 className="font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                    <i className="ri-drop-line text-cyan-600"></i>
                    <span>Meta de Hidratación</span>
                  </h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-800 text-sm">Vasos de agua al día</div>
                      <div className="text-xs text-gray-500">Aproximadamente 2 litros</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {isEditing ? (<input type="number" value={goals.daily_water_glasses} onChange={function (e) { return setGoals(__assign(__assign({}, goals), { daily_water_glasses: parseInt(e.target.value) || 0 })); }} className="w-16 p-2 bg-gray-50 rounded-lg border-none text-sm text-right"/>) : (<span className="font-bold text-gray-800">{goals.daily_water_glasses}</span>)}
                      <span className="text-sm text-gray-500">vasos</span>
                    </div>
                  </div>
                </div>
              </div>)}

            {/* Rest Days Tab */}
            {activeTab === 'rest' && (<div className="space-y-6">
                {/* Auto Adjust Toggle */}
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-800 text-sm">Ajuste automático</div>
                      <div className="text-xs text-gray-500 mt-1">
                        Reduce automáticamente las metas en días de descanso
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={goals.auto_adjust_rest_days} onChange={function (e) { return setGoals(__assign(__assign({}, goals), { auto_adjust_rest_days: e.target.checked })); }} className="sr-only peer"/>
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                    </label>
                  </div>
                </div>

                {/* Rest Days Selection */}
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <h3 className="font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                    <i className="ri-calendar-line text-purple-600"></i>
                    <span>Días de descanso</span>
                  </h3>
                  <p className="text-xs text-gray-500 mb-4">
                    Selecciona los días donde no planeas hacer ejercicio intenso
                  </p>
                  
                  <div className="grid grid-cols-7 gap-2">
                    {dayNames.map(function (day, index) { return (<button key={day} onClick={function () { return handleRestDayToggle(day); }} className={"aspect-square rounded-lg flex flex-col items-center justify-center p-2 transition-all ".concat(selectedRestDays.includes(day)
                        ? 'bg-purple-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}>
                        <div className="text-xs font-bold">{dayLabels[index]}</div>
                        <div className="text-xs mt-1 leading-tight text-center">
                          {day.substring(0, 3)}
                        </div>
                      </button>); })}
                  </div>

                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <i className="ri-information-line text-gray-500"></i>
                      <div className="text-xs text-gray-600">
                        {selectedRestDays.length === 0
                    ? 'No hay días de descanso seleccionados'
                    : "".concat(selectedRestDays.length, " d\u00EDa").concat(selectedRestDays.length > 1 ? 's' : '', " de descanso seleccionado").concat(selectedRestDays.length > 1 ? 's' : '')}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rest Day Benefits */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4">
                  <h4 className="font-medium text-purple-800 text-sm mb-3">¿Por qué días de descanso?</h4>
                  <div className="space-y-2">
                    <div className="flex items-start space-x-2">
                      <i className="ri-heart-line text-purple-600 text-sm mt-0.5"></i>
                      <div className="text-xs text-purple-700">Permite la recuperación muscular</div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <i className="ri-trophy-line text-purple-600 text-sm mt-0.5"></i>
                      <div className="text-xs text-purple-700">Mantiene la motivación a largo plazo</div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <i className="ri-shield-check-line text-purple-600 text-sm mt-0.5"></i>
                      <div className="text-xs text-purple-700">Previene el sobreentrenamiento</div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <i className="ri-scales-line text-purple-600 text-sm mt-0.5"></i>
                      <div className="text-xs text-purple-700">Ajusta metas automáticamente para mantener el progreso</div>
                    </div>
                  </div>
                </div>

                {/* Save Button for Rest Days */}
                <button onClick={handleSaveGoals} disabled={saving} className="w-full bg-gradient-to-r from-purple-400 to-purple-500 text-white py-3 rounded-lg font-medium flex items-center justify-center space-x-2">
                  {saving ? (<div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>) : (<>
                      <i className="ri-save-line"></i>
                      <span>Guardar configuración</span>
                    </>)}
                </button>
              </div>)}

            {/* Progress Tab */}
            {activeTab === 'progress' && progressStats && (<div className="space-y-6">
                {/* Weekly Summary */}
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <h3 className="font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                    <i className="ri-bar-chart-line text-green-600"></i>
                    <span>Resumen semanal</span>
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-lg font-bold text-green-600">{progressStats.active_days}</div>
                      <div className="text-xs text-gray-500">Días activos</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-lg font-bold text-purple-600">{progressStats.rest_days}</div>
                      <div className="text-xs text-gray-500">Días de descanso</div>
                    </div>
                  </div>
                </div>

                {/* Completion Rates */}
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <h3 className="font-semibold text-gray-800 mb-4">Cumplimiento de metas</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Calorías</span>
                        <span className="text-sm font-semibold text-gray-800">{progressStats.calories_avg_completion}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full transition-all duration-300" style={{ width: "".concat(Math.min(progressStats.calories_avg_completion, 100), "%") }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Ejercicio</span>
                        <span className="text-sm font-semibold text-gray-800">{progressStats.exercise_avg_completion}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full transition-all duration-300" style={{ width: "".concat(Math.min(progressStats.exercise_avg_completion, 100), "%") }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Streak */}
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-800 text-sm">Racha mantenida</div>
                      <div className="text-xs text-gray-500">Días consecutivos cumpliendo objetivos</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-orange-600">{progressStats.streak_maintained}</div>
                      <div className="text-xs text-gray-500">días</div>
                    </div>
                  </div>
                </div>

                {/* Progress Tips */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4">
                  <h4 className="font-medium text-blue-800 text-sm mb-3">Consejos para mejorar</h4>
                  <div className="space-y-2">
                    {progressStats.calories_avg_completion < 80 && (<div className="flex items-start space-x-2">
                        <i className="ri-restaurant-line text-blue-600 text-sm mt-0.5"></i>
                        <div className="text-xs text-blue-700">Intenta planificar tus comidas con anticipación</div>
                      </div>)}
                    {progressStats.exercise_avg_completion < 70 && (<div className="flex items-start space-x-2">
                        <i className="ri-run-line text-blue-600 text-sm mt-0.5"></i>
                        <div className="text-xs text-blue-700">Considera reducir tu meta de ejercicio para ser más consistente</div>
                      </div>)}
                    {progressStats.rest_days === 0 && (<div className="flex items-start space-x-2">
                        <i className="ri-calendar-line text-blue-600 text-sm mt-0.5"></i>
                        <div className="text-xs text-blue-700">Programa días de descanso para una mejor recuperación</div>
                      </div>)}
                  </div>
                </div>
              </div>)}
          </>)}
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
          <button onClick={function () { return navigate('/profile'); }} className="flex flex-col items-center justify-center space-y-1 bg-purple-50">
            <div className="w-6 h-6 flex items-center justify-center">
              <i className="ri-user-fill text-purple-600 text-lg"></i>
            </div>
            <span className="text-xs text-purple-600 font-medium">Perfil</span>
          </button>
        </div>
      </div>
    </div>);
}
