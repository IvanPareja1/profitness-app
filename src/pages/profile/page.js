"use strict";
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
exports.default = Profile;
var react_1 = require("react");
var useAuth_1 = require("../../hooks/useAuth");
var react_router_dom_1 = require("react-router-dom");
function Profile() {
    var _this = this;
    var _a = (0, useAuth_1.useAuth)(), user = _a.user, signOut = _a.signOut;
    var navigate = (0, react_router_dom_1.useNavigate)();
    var _b = (0, react_1.useState)(null), profile = _b[0], setProfile = _b[1];
    var _c = (0, react_1.useState)(true), loading = _c[0], setLoading = _c[1];
    var _d = (0, react_1.useState)({
        activeDays: 0,
        totalMeals: 0,
        totalExercises: 0,
        weightLost: 0
    }), stats = _d[0], setStats = _d[1];
    (0, react_1.useEffect)(function () {
        if (user) {
            fetchProfile();
            fetchStats();
        }
    }, [user]);
    var fetchProfile = function () { return __awaiter(_this, void 0, void 0, function () {
        var _a, data, error, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, 3, 4]);
                    return [4 /*yield*/, useAuth_1.supabase
                            .from('profiles')
                            .select('*')
                            .eq('user_id', user === null || user === void 0 ? void 0 : user.id)
                            .single()];
                case 1:
                    _a = _b.sent(), data = _a.data, error = _a.error;
                    if (error && error.code !== 'PGRST116') {
                        throw error;
                    }
                    if (data) {
                        setProfile({
                            full_name: data.full_name || 'Usuario',
                            email: data.email || (user === null || user === void 0 ? void 0 : user.email) || '',
                            age: data.age,
                            height: data.height,
                            weight: data.weight,
                            goal_weight: data.goal_weight,
                            daily_calories: data.daily_calories,
                            avatar_url: data.avatar_url
                        });
                    }
                    return [3 /*break*/, 4];
                case 2:
                    error_1 = _b.sent();
                    console.error('Error fetching profile:', error_1);
                    return [3 /*break*/, 4];
                case 3:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var fetchStats = function () { return __awaiter(_this, void 0, void 0, function () {
        var meals, exercises, allDates, uniqueDates, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, useAuth_1.supabase
                            .from('meals')
                            .select('id, created_at')
                            .eq('user_id', user === null || user === void 0 ? void 0 : user.id)];
                case 1:
                    meals = (_a.sent()).data;
                    return [4 /*yield*/, useAuth_1.supabase
                            .from('exercises')
                            .select('id, created_at')
                            .eq('user_id', user === null || user === void 0 ? void 0 : user.id)];
                case 2:
                    exercises = (_a.sent()).data;
                    allDates = __spreadArray(__spreadArray([], (meals || []).map(function (m) { var _a; return (_a = m.created_at) === null || _a === void 0 ? void 0 : _a.split('T')[0]; }), true), (exercises || []).map(function (e) { var _a; return (_a = e.created_at) === null || _a === void 0 ? void 0 : _a.split('T')[0]; }), true).filter(Boolean);
                    uniqueDates = new Set(allDates);
                    setStats({
                        activeDays: uniqueDates.size,
                        totalMeals: (meals === null || meals === void 0 ? void 0 : meals.length) || 0,
                        totalExercises: (exercises === null || exercises === void 0 ? void 0 : exercises.length) || 0,
                        weightLost: (profile === null || profile === void 0 ? void 0 : profile.weight) && (profile === null || profile === void 0 ? void 0 : profile.goal_weight)
                            ? Math.max(0, profile.weight - profile.goal_weight)
                            : 0
                    });
                    return [3 /*break*/, 4];
                case 3:
                    error_2 = _a.sent();
                    console.error('Error fetching stats:', error_2);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleSignOut = function () { return __awaiter(_this, void 0, void 0, function () {
        var error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, signOut()];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    error_3 = _a.sent();
                    console.error('Error signing out:', error_3);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var getInitials = function (name) {
        return name
            .split(' ')
            .map(function (word) { return word[0]; })
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };
    var calculateBMI = function () {
        if ((profile === null || profile === void 0 ? void 0 : profile.weight) && (profile === null || profile === void 0 ? void 0 : profile.height)) {
            var heightInMeters = profile.height / 100;
            return (profile.weight / (heightInMeters * heightInMeters)).toFixed(1);
        }
        return null;
    };
    var getRemainingWeight = function () {
        if ((profile === null || profile === void 0 ? void 0 : profile.weight) && (profile === null || profile === void 0 ? void 0 : profile.goal_weight)) {
            return Math.max(0, profile.weight - profile.goal_weight);
        }
        return 0;
    };
    var getCaloriesProgress = function () {
        // Simulación de progreso de calorías del día
        return Math.floor(Math.random() * 30) + 70; // 70-100%
    };
    if (loading) {
        return (<div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-600">Cargando perfil...</p>
        </div>
      </div>);
    }
    return (<div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 pb-20">
      {/* Header */}
      <div className="fixed top-0 w-full bg-white/90 backdrop-blur-md shadow-sm z-50">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold text-gray-800">Perfil</h1>
            <button className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
              <i className="ri-settings-line text-gray-600 text-lg"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="pt-20 px-4">
        {/* User Profile */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6 text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
            {(profile === null || profile === void 0 ? void 0 : profile.avatar_url) ? (<img src={profile.avatar_url} alt="Avatar" className="w-full h-full rounded-full object-cover"/>) : (<span className="text-white text-xl font-bold">
                {getInitials((profile === null || profile === void 0 ? void 0 : profile.full_name) || 'U')}
              </span>)}
          </div>
          <h2 className="text-lg font-semibold text-gray-800 mb-1">{profile === null || profile === void 0 ? void 0 : profile.full_name}</h2>
          <p className="text-gray-600 text-sm mb-4">{profile === null || profile === void 0 ? void 0 : profile.email}</p>
          
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-800">{stats.activeDays}</div>
              <div className="text-xs text-gray-500">días activo</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-800">{getRemainingWeight().toFixed(1)}</div>
              <div className="text-xs text-gray-500">kg por perder</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-800">{stats.totalExercises}</div>
              <div className="text-xs text-gray-500">entrenamientos</div>
            </div>
          </div>
        </div>

        {/* Goals */}
        <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
          <h3 className="font-semibold text-gray-800 mb-4">Mis objetivos</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <i className="ri-trophy-line text-green-600"></i>
                </div>
                <div>
                  <div className="font-medium text-gray-800 text-sm">Peso objetivo</div>
                  <div className="text-xs text-gray-500">
                    {(profile === null || profile === void 0 ? void 0 : profile.goal_weight) ? "".concat(profile.goal_weight, " kg") : 'No definido'}
                  </div>
                </div>
              </div>
              <div className="text-sm font-semibold text-green-600">
                {getRemainingWeight().toFixed(1)} kg restantes
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <i className="ri-fire-line text-blue-600"></i>
                </div>
                <div>
                  <div className="font-medium text-gray-800 text-sm">Calorías diarias</div>
                  <div className="text-xs text-gray-500">
                    {(profile === null || profile === void 0 ? void 0 : profile.daily_calories) ? "".concat(profile.daily_calories, " kcal") : '2,200 kcal'}
                  </div>
                </div>
              </div>
              <div className="text-sm font-semibold text-blue-600">{getCaloriesProgress()}% hoy</div>
            </div>
          </div>
        </div>

        {/* Health Data */}
        <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
          <h3 className="font-semibold text-gray-800 mb-4">Datos de salud</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-lg font-bold text-gray-800">
                {(profile === null || profile === void 0 ? void 0 : profile.weight) ? "".concat(profile.weight, " kg") : '--'}
              </div>
              <div className="text-xs text-gray-500">Peso actual</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-lg font-bold text-gray-800">
                {(profile === null || profile === void 0 ? void 0 : profile.height) ? "".concat(profile.height, " cm") : '--'}
              </div>
              <div className="text-xs text-gray-500">Altura</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-lg font-bold text-gray-800">
                {calculateBMI() || '--'}
              </div>
              <div className="text-xs text-gray-500">IMC</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-lg font-bold text-gray-800">
                {(profile === null || profile === void 0 ? void 0 : profile.age) ? "".concat(profile.age, " a\u00F1os") : '--'}
              </div>
              <div className="text-xs text-gray-500">Edad</div>
            </div>
          </div>
        </div>

        {/* Menu Options */}
        <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
          <div className="space-y-1">
            {[
            { icon: 'ri-target-line', label: 'Mis metas y objetivos', color: 'text-purple-600', action: function () { return navigate('/goals'); } },
            { icon: 'ri-bar-chart-line', label: 'Estadísticas detalladas', color: 'text-blue-600' },
            { icon: 'ri-medal-line', label: 'Logros y medallas', color: 'text-yellow-600' },
            { icon: 'ri-heart-line', label: 'Datos de salud', color: 'text-red-600' },
            { icon: 'ri-notification-line', label: 'Notificaciones', color: 'text-purple-600' },
            { icon: 'ri-shield-check-line', label: 'Privacidad', color: 'text-green-600' },
            { icon: 'ri-question-line', label: 'Ayuda y soporte', color: 'text-gray-600' }
        ].map(function (item, index) { return (<button key={index} onClick={item.action} className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="flex items-center space-x-3">
                  <i className={"".concat(item.icon, " ").concat(item.color, " text-lg")}></i>
                  <span className="text-gray-800 text-sm">{item.label}</span>
                </div>
                <i className="ri-arrow-right-s-line text-gray-400"></i>
              </button>); })}
          </div>
        </div>

        {/* Logout */}
        <button onClick={handleSignOut} className="w-full bg-red-50 text-red-600 py-3 rounded-lg font-medium flex items-center justify-center space-x-2">
          <i className="ri-logout-box-line"></i>
          <span>Cerrar sesión</span>
        </button>
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
          <button className="flex flex-col items-center justify-center space-y-1 bg-purple-50">
            <div className="w-6 h-6 flex items-center justify-center">
              <i className="ri-user-fill text-purple-600 text-lg"></i>
            </div>
            <span className="text-xs text-purple-600 font-medium">Perfil</span>
          </button>
        </div>
      </div>
    </div>);
}
