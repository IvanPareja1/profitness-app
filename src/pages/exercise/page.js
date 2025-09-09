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
exports.default = Exercise;
var react_1 = require("react");
var react_router_dom_1 = require("react-router-dom");
var useAuth_1 = require("../../hooks/useAuth");
function Exercise() {
    var _this = this;
    var _a = (0, react_1.useState)(new Date().toISOString().split('T')[0]), selectedDate = _a[0], setSelectedDate = _a[1];
    var _b = (0, react_1.useState)({ totalExercises: 0, totalDuration: 0, totalCalories: 0, totalSets: 0, totalReps: 0 }), totals = _b[0], setTotals = _b[1];
    var _c = (0, react_1.useState)(false), activeWorkout = _c[0], setActiveWorkout = _c[1];
    var _d = (0, react_1.useState)(false), showAddForm = _d[0], setShowAddForm = _d[1];
    var _e = (0, react_1.useState)(false), showSearch = _e[0], setShowSearch = _e[1];
    var _f = (0, react_1.useState)(''), searchQuery = _f[0], setSearchQuery = _f[1];
    var _g = (0, react_1.useState)([]), searchResults = _g[0], setSearchResults = _g[1];
    var _h = (0, react_1.useState)({
        name: '',
        type: '',
        weight: '',
        reps: '',
        sets: '',
        duration: '',
        notes: ''
    }), exerciseForm = _h[0], setExerciseForm = _h[1];
    // Hydration states
    var _j = (0, react_1.useState)(0), waterIntake = _j[0], setWaterIntake = _j[1];
    var dailyGoal = (0, react_1.useState)(2500)[0]; // 2.5L daily goal
    var _k = (0, react_1.useState)(false), showHydrationForm = _k[0], setShowHydrationForm = _k[1];
    var _l = (0, react_1.useState)(''), customAmount = _l[0], setCustomAmount = _l[1];
    var _m = (0, react_1.useState)(null), lastReminder = _m[0], setLastReminder = _m[1];
    var _o = (0, react_1.useState)('workout'), activeTab = _o[0], setActiveTab = _o[1];
    var _p = (0, react_1.useState)([]), exercises = _p[0], setExercises = _p[1];
    var _q = (0, react_1.useState)(null), selectedExercise = _q[0], setSelectedExercise = _q[1];
    var _r = (0, react_1.useState)(false), showExerciseModal = _r[0], setShowExerciseModal = _r[1];
    var _s = (0, react_1.useState)(1), currentSet = _s[0], setCurrentSet = _s[1];
    var _t = (0, react_1.useState)(0), currentRep = _t[0], setCurrentRep = _t[1];
    var _u = (0, react_1.useState)(false), isResting = _u[0], setIsResting = _u[1];
    var _v = (0, react_1.useState)(60), restTime = _v[0], setRestTime = _v[1];
    var _w = (0, react_1.useState)(false), workoutStarted = _w[0], setWorkoutStarted = _w[1];
    var workoutTime = (0, react_1.useState)(0)[0];
    var _x = (0, react_1.useState)([]), completedExercises = _x[0], setCompletedExercises = _x[1];
    var _y = (0, react_1.useState)({
        totalWorkouts: 0,
        totalExercises: 0,
        totalDuration: 0,
        caloriesBurned: 0
    }), todayStats = _y[0], setTodayStats = _y[1];
    var _z = (0, react_1.useState)(false), loading = _z[0], setLoading = _z[1];
    var _0 = (0, react_1.useState)([]), workoutHistory = _0[0], setWorkoutHistory = _0[1];
    // Configuración de recordatorios
    var reminderEnabled = (0, react_1.useState)(true)[0];
    var reminderInterval = (0, react_1.useState)(60)[0]; // minutes
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
    var loadExercises = function () { return __awaiter(_this, void 0, void 0, function () {
        var data, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, 3, 4]);
                    setLoading(true);
                    return [4 /*yield*/, callSupabaseFunction("exercises?date=".concat(selectedDate))];
                case 1:
                    data = _a.sent();
                    setExercises(data.exercises || []);
                    setTotals(data.totals || { totalExercises: 0, totalDuration: 0, totalCalories: 0, totalSets: 0, totalReps: 0 });
                    return [3 /*break*/, 4];
                case 2:
                    error_1 = _a.sent();
                    console.error('Error loading exercises:', error_1);
                    return [3 /*break*/, 4];
                case 3:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var searchExercises = function (query) { return __awaiter(_this, void 0, void 0, function () {
        var data, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!query.trim()) {
                        setSearchResults([]);
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, callSupabaseFunction('exercises/templates', {
                            method: 'POST',
                            body: { query: query }
                        })];
                case 2:
                    data = _a.sent();
                    setSearchResults(data.results || []);
                    return [3 /*break*/, 4];
                case 3:
                    error_2 = _a.sent();
                    console.error('Error searching exercises:', error_2);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var selectExerciseTemplate = function (template) {
        setExerciseForm({
            name: template.name,
            type: template.type,
            weight: template.type === 'fuerza' ? '50' : '',
            reps: template.type === 'fuerza' ? '12' : '',
            sets: template.type === 'fuerza' ? '3' : '',
            duration: template.type === 'cardio' ? '30' : template.type === 'fuerza' ? '45' : '20',
            notes: ''
        });
        setShowSearch(false);
        setSearchQuery('');
        setSearchResults([]);
    };
    var handleAddExercise = function () { return __awaiter(_this, void 0, void 0, function () {
        var error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!exerciseForm.name || !exerciseForm.type)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, callSupabaseFunction('exercises', {
                            method: 'POST',
                            body: {
                                name: exerciseForm.name,
                                type: exerciseForm.type,
                                duration: parseInt(exerciseForm.duration) || 0,
                                weight: exerciseForm.weight ? parseFloat(exerciseForm.weight) : null,
                                reps: exerciseForm.reps ? parseInt(exerciseForm.reps) : null,
                                sets: exerciseForm.sets ? parseInt(exerciseForm.sets) : null,
                                notes: exerciseForm.notes || null
                            }
                        })];
                case 2:
                    _a.sent();
                    setExerciseForm({
                        name: '',
                        type: '',
                        weight: '',
                        reps: '',
                        sets: '',
                        duration: '',
                        notes: ''
                    });
                    setShowAddForm(false);
                    loadExercises();
                    return [3 /*break*/, 4];
                case 3:
                    error_3 = _a.sent();
                    console.error('Error adding exercise:', error_3);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var deleteExercise = function (exerciseId) { return __awaiter(_this, void 0, void 0, function () {
        var error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, callSupabaseFunction("exercises/".concat(exerciseId), {
                            method: 'DELETE'
                        })];
                case 1:
                    _a.sent();
                    loadExercises();
                    return [3 /*break*/, 3];
                case 2:
                    error_4 = _a.sent();
                    console.error('Error deleting exercise:', error_4);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    (0, react_1.useEffect)(function () {
        if (user) {
            loadExercises();
        }
    }, [selectedDate, user]);
    (0, react_1.useEffect)(function () {
        if (searchQuery) {
            var timeoutId_1 = setTimeout(function () { return searchExercises(searchQuery); }, 300);
            return function () { return clearTimeout(timeoutId_1); };
        }
        else {
            setSearchResults([]);
        }
    }, [searchQuery]);
    // Water reminder effect
    (0, react_1.useEffect)(function () {
        if (!reminderEnabled)
            return;
        var interval = setInterval(function () {
            var now = new Date();
            if (!lastReminder || (now.getTime() - lastReminder.getTime()) >= reminderInterval * 60 * 1000) {
                showWaterReminder();
                setLastReminder(now);
            }
        }, 60000); // Check every minute
        return function () { return clearInterval(interval); };
    }, [reminderEnabled, reminderInterval, lastReminder]);
    var showWaterReminder = function () {
        if ('Notification' in window) {
            if (Notification.permission === 'granted') {
                new Notification('💧 Hora de hidratarte', {
                    body: 'No olvides tomar agua para mantener tu rendimiento óptimo',
                    icon: '/icon-192x192.png'
                });
            }
            else if (Notification.permission !== 'denied') {
                Notification.requestPermission().then(function (permission) {
                    if (permission === 'granted') {
                        new Notification('💧 Hora de hidratarte', {
                            body: 'No olvides tomar agua para mantener tu rendimiento óptimo',
                            icon: '/icon-192x192.png'
                        });
                    }
                });
            }
        }
        // Visual reminder
        var reminder = document.createElement('div');
        reminder.className = 'fixed top-20 left-4 right-4 bg-blue-500 text-white p-4 rounded-xl shadow-lg z-50 animate-pulse';
        reminder.innerHTML = "\n      <div class=\"flex items-center space-x-3\">\n        <i class=\"ri-drop-line text-2xl\"></i>\n        <div>\n          <div class=\"font-semibold\">\u00A1Hora de hidratarte! \uD83D\uDCA7</div>\n          <div class=\"text-sm opacity-90\">Toma un vaso de agua para mantener tu energ\u00EDa</div>\n        </div>\n        <button onclick=\"this.parentElement.parentElement.remove()\" class=\"text-white/80 hover:text-white\">\n          <i class=\"ri-close-line text-xl\"></i>\n        </button>\n      </div>\n    ";
        document.body.appendChild(reminder);
        setTimeout(function () {
            if (reminder.parentElement) {
                reminder.remove();
            }
        }, 5000);
    };
    var addWater = function (amount) {
        setWaterIntake(function (prev) { return Math.min(prev + amount, dailyGoal + 1000); });
        setLastReminder(new Date()); // Reset reminder timer
    };
    var addCustomWater = function () {
        var amount = parseInt(customAmount);
        if (amount > 0) {
            addWater(amount);
            setCustomAmount('');
            setShowHydrationForm(false);
        }
    };
    var resetWaterIntake = function () {
        setWaterIntake(0);
    };
    var handleInputChange = function (field, value) {
        setExerciseForm(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[field] = value, _a)));
        });
    };
    var getExerciseIcon = function (type) {
        switch (type) {
            case 'cardio': return 'ri-heart-pulse-line';
            case 'fuerza': return 'ri-sword-line';
            case 'resistencia': return 'ri-fire-line';
            case 'flexibilidad': return 'ri-leaf-line';
            default: return 'ri-run-line';
        }
    };
    var getExerciseColor = function (type) {
        switch (type) {
            case 'cardio': return 'text-red-600 bg-red-100';
            case 'fuerza': return 'text-purple-600 bg-purple-100';
            case 'resistencia': return 'text-orange-600 bg-orange-100';
            case 'flexibilidad': return 'text-green-600 bg-green-100';
            default: return 'text-blue-600 bg-blue-100';
        }
    };
    return (<div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 pb-20">
      {/* Header */}
      <div className="fixed top-0 w-full bg-white/90 backdrop-blur-md shadow-sm z-50">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold text-gray-800">Ejercicio</h1>
            <input type="date" value={selectedDate} onChange={function (e) { return setSelectedDate(e.target.value); }} className="text-sm bg-gray-100 rounded-lg px-3 py-2 border-none"/>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="pt-20 px-4">
        {/* Daily Summary */}
        <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
          <h3 className="font-semibold text-gray-800 mb-4">Resumen del día</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-xl font-bold text-blue-600">{totals.totalExercises}</div>
              <div className="text-xs text-gray-600">Ejercicios</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-xl font-bold text-green-600">{totals.totalDuration}</div>
              <div className="text-xs text-gray-600">Minutos</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-xl font-bold text-red-600">{totals.totalCalories}</div>
              <div className="text-xs text-gray-600">Calorías</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-xl font-bold text-purple-600">{totals.totalSets}</div>
              <div className="text-xs text-gray-600">Series</div>
            </div>
          </div>
        </div>

        {/* Hydration Section */}
        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl p-4 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <i className="ri-drop-line text-xl"></i>
              </div>
              <div>
                <h3 className="font-semibold">Hidratación diaria</h3>
                <p className="text-blue-100 text-sm">Meta: {(dailyGoal / 1000).toFixed(1)}L</p>
              </div>
            </div>
            <button onClick={function () { return setShowHydrationForm(!showHydrationForm); }} className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <i className={"ri-".concat(showHydrationForm ? 'close' : 'add', "-line")}></i>
            </button>
          </div>

          {/* Progress */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-blue-100">Progreso</span>
              <span className="font-semibold">{waterIntake}ml / {dailyGoal}ml</span>
            </div>
            <div className="w-full bg-blue-400/30 rounded-full h-3">
              <div className="bg-white h-3 rounded-full transition-all duration-500" style={{ width: "".concat(Math.min((waterIntake / dailyGoal) * 100, 100), "%") }}></div>
            </div>
            <div className="text-right mt-1">
              <span className="text-xs text-blue-100">
                {Math.round((waterIntake / dailyGoal) * 100)}% completado
              </span>
            </div>
          </div>

          {/* Quick Add Buttons */}
          {!showHydrationForm && (<div className="grid grid-cols-4 gap-2">
              <button onClick={function () { return addWater(250); }} className="bg-white/20 py-2 rounded-lg text-center">
                <div className="text-sm font-medium">250ml</div>
                <div className="text-xs text-blue-100">Vaso</div>
              </button>
              <button onClick={function () { return addWater(500); }} className="bg-white/20 py-2 rounded-lg text-center">
                <div className="text-sm font-medium">500ml</div>
                <div className="text-xs text-blue-100">Botella</div>
              </button>
              <button onClick={function () { return addWater(750); }} className="bg-white/20 py-2 rounded-lg text-center">
                <div className="text-sm font-medium">750ml</div>
                <div className="text-xs text-blue-100">Deportiva</div>
              </button>
              <button onClick={function () { return addWater(1000); }} className="bg-white/20 py-2 rounded-lg text-center">
                <div className="text-sm font-medium">1L</div>
                <div className="text-xs text-blue-100">Grande</div>
              </button>
            </div>)}

          {/* Custom Amount Form */}
          {showHydrationForm && (<div className="space-y-3">
              <div>
                <label className="block text-sm text-blue-100 mb-2">Cantidad personalizada (ml)</label>
                <input type="number" placeholder="Ej: 350" value={customAmount} onChange={function (e) { return setCustomAmount(e.target.value); }} className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-200 text-sm"/>
              </div>
              <div className="flex space-x-2">
                <button onClick={addCustomWater} className="flex-1 bg-white/20 py-2 rounded-lg font-medium">
                  Agregar agua
                </button>
                <button onClick={resetWaterIntake} className="px-4 bg-red-400/20 py-2 rounded-lg font-medium">
                  Reiniciar
                </button>
              </div>
            </div>)}
        </div>

        {/* Active Workout Status */}
        {activeWorkout && (<div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl p-4 mb-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold mb-1">Entrenamiento activo</h3>
                <p className="text-blue-100 text-sm">Entrenamiento de fuerza</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{Math.floor(workoutTime / 60)}:{(workoutTime % 60).toString().padStart(2, '0')}</div>
                <p className="text-blue-100 text-xs">tiempo transcurrido</p>
              </div>
            </div>
            <div className="mt-4 flex space-x-3">
              <button className="flex-1 bg-white/20 py-2 rounded-lg font-medium">
                Pausar
              </button>
              <button onClick={function () { return setActiveWorkout(false); }} className="flex-1 bg-white/20 py-2 rounded-lg font-medium">
                Finalizar
              </button>
            </div>
          </div>)}

        {/* Quick Start */}
        <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
          <h3 className="font-semibold text-gray-800 mb-4">Inicio rápido</h3>
          <div className="grid grid-cols-2 gap-4">
            <button onClick={function () { return setActiveWorkout(true); }} className="bg-gradient-to-r from-blue-400 to-blue-500 text-white p-4 rounded-xl flex flex-col items-center space-y-2">
              <i className="ri-timer-line text-2xl"></i>
              <span className="font-medium text-sm">Entrenar ahora</span>
            </button>
            <button className="bg-gradient-to-r from-purple-400 to-purple-500 text-white p-4 rounded-xl flex flex-col items-center space-y-2">
              <i className="ri-walk-line text-2xl"></i>
              <span className="font-medium text-sm">Caminar</span>
            </button>
          </div>
        </div>

        {/* Add Exercise Form */}
        <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Agregar ejercicio</h3>
            <button onClick={function () { return setShowAddForm(!showAddForm); }} className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <i className={"ri-".concat(showAddForm ? 'close' : 'add', "-line text-blue-600")}></i>
            </button>
          </div>
          
          {showAddForm && (<div className="space-y-4">
              {/* Search Toggle */}
              <div className="flex space-x-2">
                <button onClick={function () { return setShowSearch(!showSearch); }} className={"px-4 py-2 rounded-lg text-sm font-medium ".concat(showSearch ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700')}>
                  Buscar ejercicio
                </button>
                <button onClick={function () { return setShowSearch(false); }} className={"px-4 py-2 rounded-lg text-sm font-medium ".concat(!showSearch ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700')}>
                  Manual
                </button>
              </div>

              {/* Search Section */}
              {showSearch && (<div>
                  <input type="text" placeholder="Buscar ejercicios (ej: flexiones, correr...)" value={searchQuery} onChange={function (e) { return setSearchQuery(e.target.value); }} className="w-full p-3 bg-gray-50 rounded-lg border-none text-sm mb-3"/>
                  
                  {searchResults.length > 0 && (<div className="max-h-48 overflow-y-auto space-y-2">
                      {searchResults.map(function (result, index) { return (<button key={index} onClick={function () { return selectExerciseTemplate(result); }} className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-medium text-gray-800 text-sm">{result.name}</div>
                              <div className="text-xs text-gray-500">{result.category} • {result.type}</div>
                            </div>
                            <div className="text-xs text-blue-600">
                              ~{result.calories_per_min} kcal/min
                            </div>
                          </div>
                        </button>); })}
                    </div>)}
                </div>)}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del ejercicio</label>
                <input type="text" placeholder="Ej: Press de banca, Sentadillas..." value={exerciseForm.name} onChange={function (e) { return handleInputChange('name', e.target.value); }} className="w-full p-3 bg-gray-50 rounded-lg border-none text-sm"/>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de ejercicio</label>
                <select value={exerciseForm.type} onChange={function (e) { return handleInputChange('type', e.target.value); }} className="w-full p-3 bg-gray-50 rounded-lg border-none text-sm">
                  <option value="">Seleccionar tipo</option>
                  <option value="fuerza">Fuerza</option>
                  <option value="cardio">Cardio</option>
                  <option value="flexibilidad">Flexibilidad</option>
                  <option value="resistencia">Resistencia</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Duración (min)</label>
                  <input type="number" placeholder="30" value={exerciseForm.duration} onChange={function (e) { return handleInputChange('duration', e.target.value); }} className="w-full p-3 bg-gray-50 rounded-lg border-none text-sm"/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Peso (kg)</label>
                  <input type="number" placeholder="50" value={exerciseForm.weight} onChange={function (e) { return handleInputChange('weight', e.target.value); }} className="w-full p-3 bg-gray-50 rounded-lg border-none text-sm"/>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Series</label>
                  <input type="number" placeholder="3" value={exerciseForm.sets} onChange={function (e) { return handleInputChange('sets', e.target.value); }} className="w-full p-3 bg-gray-50 rounded-lg border-none text-sm"/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Repeticiones</label>
                  <input type="number" placeholder="12" value={exerciseForm.reps} onChange={function (e) { return handleInputChange('reps', e.target.value); }} className="w-full p-3 bg-gray-50 rounded-lg border-none text-sm"/>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notas (opcional)</label>
                <textarea placeholder="Observaciones sobre el ejercicio..." value={exerciseForm.notes} onChange={function (e) { return handleInputChange('notes', e.target.value); }} className="w-full p-3 bg-gray-50 rounded-lg border-none text-sm h-20 resize-none"/>
              </div>

              <button onClick={handleAddExercise} disabled={!exerciseForm.name || !exerciseForm.type} className="w-full bg-gradient-to-r from-blue-400 to-blue-500 text-white py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed">
                Agregar ejercicio
              </button>
            </div>)}
        </div>

        {/* Today's Exercises */}
        <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
          <h3 className="font-semibold text-gray-800 mb-4">Ejercicios del día</h3>
          
          {loading ? (<div className="text-center py-6">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-gray-500 text-sm">Cargando ejercicios...</p>
            </div>) : exercises.length === 0 ? (<div className="text-center py-6">
              <i className="ri-run-line text-3xl text-gray-300 mb-2"></i>
              <p className="text-gray-500 text-sm">No hay ejercicios registrados</p>
              <button onClick={function () { return setShowAddForm(true); }} className="text-blue-600 text-sm font-medium mt-2">
                Añadir primer ejercicio
              </button>
            </div>) : (<div className="space-y-3">
              {exercises.map(function (exercise) { return (<div key={exercise.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={"w-10 h-10 ".concat(getExerciseColor(exercise.type), " rounded-full flex items-center justify-center")}>
                      <i className={getExerciseIcon(exercise.type)}></i>
                    </div>
                    <div>
                      <div className="font-medium text-gray-800 text-sm">{exercise.name}</div>
                      <div className="text-xs text-gray-500">
                        {exercise.duration}min
                        {exercise.sets && exercise.reps && " \u2022 ".concat(exercise.sets, "x").concat(exercise.reps)}
                        {exercise.weight && " \u2022 ".concat(exercise.weight, "kg")}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-800">{exercise.calories_burned} kcal</div>
                      <div className="text-xs text-gray-500">
                        {new Date(exercise.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <button onClick={function () { return deleteExercise(exercise.id); }} className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <i className="ri-delete-bin-line text-red-600 text-sm"></i>
                    </button>
                  </div>
                </div>); })}
            </div>)}
        </div>

        {/* Exercise Programs */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4">Programas recomendados</h3>
          <div className="space-y-3">
            {[
            {
                name: 'Rutina de principiante',
                duration: '4 semanas',
                exercises: '12 ejercicios',
                difficulty: 'Fácil',
                image: 'beginner workout routine with basic exercises, gym setting, clean professional photography, motivational fitness atmosphere'
            },
            {
                name: 'Cardio intensivo',
                duration: '6 semanas',
                exercises: '15 ejercicios',
                difficulty: 'Intermedio',
                image: 'intensive cardio workout equipment and setup, dynamic fitness environment, high energy professional photography'
            },
            {
                name: 'Fuerza avanzada',
                duration: '8 semanas',
                exercises: '20 ejercicios',
                difficulty: 'Avanzado',
                image: 'advanced strength training equipment heavy weights, professional gym setup, serious fitness atmosphere'
            }
        ].map(function (program, index) { return (<div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <img src={"https://readdy.ai/api/search-image?query=$%7Bprogram.image%7D&width=80&height=60&seq=program".concat(index, "&orientation=landscape")} alt={program.name} className="w-16 h-12 rounded-lg object-cover"/>
                <div className="flex-1">
                  <div className="font-medium text-gray-800 text-sm">{program.name}</div>
                  <div className="text-xs text-gray-500">{program.duration} • {program.exercises}</div>
                </div>
                <div className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                  {program.difficulty}
                </div>
              </div>); })}
          </div>
        </div>
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
          <button className="flex flex-col items-center justify-center space-y-1 bg-blue-50">
            <div className="w-6 h-6 flex items-center justify-center">
              <i className="ri-run-fill text-blue-600 text-lg"></i>
            </div>
            <span className="text-xs text-blue-600 font-medium">Ejercicio</span>
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
