
'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function HelpPage() {
  const [activeCategory, setActiveCategory] = useState('general');
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    category: 'general',
    message: ''
  });

  const helpCategories = [
    { id: 'general', name: 'General', icon: 'ri-question-line' },
    { id: 'food', name: 'Comidas', icon: 'ri-restaurant-line' },
    { id: 'workout', name: 'Ejercicios', icon: 'ri-run-line' },
    { id: 'progress', name: 'Progreso', icon: 'ri-bar-chart-line' },
    { id: 'account', name: 'Cuenta', icon: 'ri-user-line' }
  ];

  const faqData = {
    general: [
      {
        id: 1,
        question: '¿Cómo empiezo a usar la aplicación?',
        answer: 'Para comenzar, completa tu perfil con información básica como edad, peso, altura y objetivos. Luego empieza a registrar tus comidas y ejercicios diarios.'
      },
      {
        id: 2,
        question: '¿Es gratuita la aplicación?',
        answer: 'La aplicación tiene funciones básicas gratuitas. Las funciones premium incluyen planes personalizados, análisis detallados y seguimiento avanzado.'
      },
      {
        id: 3,
        question: '¿Cómo sincronizo mis datos?',
        answer: 'Tus datos se sincronizan automáticamente cuando tienes conexión a internet. También puedes forzar la sincronización en Configuración > Sincronización.'
      }
    ],
    food: [
      {
        id: 4,
        question: '¿Cómo registro mis comidas?',
        answer: 'Ve a la sección Comida, selecciona el tipo de comida (desayuno, almuerzo, cena) y busca los alimentos que consumiste. También puedes usar la cámara para identificar automáticamente los alimentos.'
      },
      {
        id: 5,
        question: '¿Puedo agregar alimentos personalizados?',
        answer: 'Sí, puedes crear alimentos personalizados ingresando manualmente las calorías y macronutrientes. Ve a Agregar Comida > Manual > Alimento Personalizado.'
      },
      {
        id: 6,
        question: '¿Cómo funciona el reconocimiento de alimentos por cámara?',
        answer: 'Usa inteligencia artificial para identificar alimentos en fotos. Simplemente toma una foto de tu comida y la app estimará las calorías y nutrientes automáticamente.'
      }
    ],
    workout: [
      {
        id: 7,
        question: '¿Cómo registro mis ejercicios?',
        answer: 'En la sección Ejercicio puedes elegir entre rutinas predefinidas o crear las tuyas. Registra sets, repeticiones, peso usado y tiempo de descanso.'
      },
      {
        id: 8,
        question: '¿Puedo crear mis propias rutinas?',
        answer: 'Sí, puedes crear rutinas personalizadas seleccionando ejercicios de nuestra base de datos o agregando ejercicios nuevos con descripción y músculos trabajados.'
      },
      {
        id: 9,
        question: '¿Cómo programo días de descanso?',
        answer: 'En el calendario de entrenamiento puedes marcar días como descanso activo o descanso completo. Esto se incluye en tu planificación semanal.'
      }
    ],
    progress: [
      {
        id: 10,
        question: '¿Cómo veo mi progreso?',
        answer: 'La sección Progreso muestra gráficos de tu evolución en peso, medidas corporales, fuerza y resistencia. Puedes ver datos diarios, semanales o mensuales.'
      },
      {
        id: 11,
        question: '¿Puedo establecer metas personales?',
        answer: 'Sí, en Perfil > Metas puedes establecer objetivos de peso, medidas corporales, levantamiento de peso y tiempo de ejercicio cardiovascular.'
      },
      {
        id: 12,
        question: '¿Cómo interpreto los datos nutricionales?',
        answer: 'Los gráficos muestran tu ingesta de calorías, proteínas, carbohidratos y grasas vs tus objetivos diarios. Verde indica que estás dentro del rango objetivo.'
      }
    ],
    account: [
      {
        id: 13,
        question: '¿Cómo cambio mi contraseña?',
        answer: 'Ve a Perfil > Privacidad y Seguridad > Cambiar Contraseña. Necesitarás tu contraseña actual y la nueva contraseña.'
      },
      {
        id: 14,
        question: '¿Puedo exportar mis datos?',
        answer: 'Sí, en Perfil > Exportar Datos puedes descargar toda tu información en formato PDF, CSV o JSON para uso personal o con profesionales de salud.'
      },
      {
        id: 15,
        question: '¿Cómo elimino mi cuenta?',
        answer: 'Para eliminar tu cuenta permanentemente, ve a Perfil > Privacidad y Seguridad > Zona de Peligro > Eliminar Cuenta. Esta acción no se puede deshacer.'
      }
    ]
  };

  const quickActions = [
    { 
      id: 'tutorial', 
      name: 'Tutorial Interactivo', 
      icon: 'ri-play-circle-line', 
      color: 'bg-blue-100 text-blue-600',
      description: 'Aprende a usar todas las funciones' 
    },
    { 
      id: 'video', 
      name: 'Videos de Ayuda', 
      icon: 'ri-video-line', 
      color: 'bg-red-100 text-red-600',
      description: 'Tutoriales paso a paso' 
    },
    { 
      id: 'tips', 
      name: 'Consejos Diarios', 
      icon: 'ri-lightbulb-line', 
      color: 'bg-yellow-100 text-yellow-600',
      description: 'Tips para mejorar tus hábitos' 
    },
    { 
      id: 'community', 
      name: 'Comunidad', 
      icon: 'ri-group-line', 
      color: 'bg-green-100 text-green-600',
      description: 'Conecta con otros usuarios' 
    }
  ];

  const supportOptions = [
    {
      title: 'Chat en Vivo',
      description: 'Respuesta inmediata de 9:00 - 18:00',
      icon: 'ri-message-3-line',
      color: 'bg-purple-500',
      available: true
    },
    {
      title: 'Email de Soporte',
      description: 'Respuesta en 24 horas',
      icon: 'ri-mail-line',
      color: 'bg-blue-500',
      available: true
    },
    {
      title: 'Llamada Telefónica',
      description: 'Soporte premium únicamente',
      icon: 'ri-phone-line',
      color: 'bg-green-500',
      available: false
    }
  ];

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Mensaje enviado correctamente. Te responderemos a ${contactForm.email} en las próximas 24 horas.`);
    setContactForm({ name: '', email: '', category: 'general', message: '' });
  };

  const toggleFAQ = (id: number) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Header */}
      <div className="fixed top-0 w-full bg-white/90 backdrop-blur-md z-50 px-4 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <Link href="/profile" className="w-8 h-8 flex items-center justify-center">
            <i className="ri-arrow-left-line text-gray-600 text-lg"></i>
          </Link>
          <h1 className="text-lg font-bold text-gray-800">Centro de Ayuda</h1>
          <button className="w-8 h-8 flex items-center justify-center">
            <i className="ri-search-line text-gray-600 text-lg"></i>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="pt-20 pb-24 px-4">
        {/* Search Bar */}
        <div className="bg-white rounded-2xl p-4 mb-6 shadow-sm">
          <div className="relative">
            <input
              type="text"
              className="w-full px-4 py-3 pl-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="¿En qué podemos ayudarte?"
            />
            <i className="ri-search-line text-gray-400 text-lg absolute left-4 top-1/2 transform -translate-y-1/2"></i>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl p-5 mb-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Acciones Rápidas</h2>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => (
              <button
                key={action.id}
                className="p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors text-left"
              >
                <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center mb-3`}>
                  <i className={`${action.icon} text-lg`}></i>
                </div>
                <p className="font-medium text-gray-800 text-sm mb-1">{action.name}</p>
                <p className="text-xs text-gray-600">{action.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Support Options */}
        <div className="bg-white rounded-2xl p-5 mb-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Contactar Soporte</h2>
          <div className="space-y-3">
            {supportOptions.map((option, index) => (
              <div
                key={index}
                className={`p-4 rounded-xl border ${option.available ? 'border-gray-200 hover:bg-gray-50' : 'border-gray-100 bg-gray-50'} transition-colors`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-10 h-10 ${option.color} rounded-lg flex items-center justify-center mr-3`}>
                      <i className={`${option.icon} text-white text-lg`}></i>
                    </div>
                    <div>
                      <p className={`font-medium ${option.available ? 'text-gray-800' : 'text-gray-500'}`}>
                        {option.title}
                      </p>
                      <p className="text-sm text-gray-600">{option.description}</p>
                    </div>
                  </div>
                  {option.available ? (
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  ) : (
                    <div className="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded-full">
                      No disponible
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Categories */}
        <div className="bg-white rounded-2xl p-5 mb-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Preguntas Frecuentes</h2>
          
          {/* Category Tabs */}
          <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
            {helpCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  activeCategory === category.id
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <i className={`${category.icon} text-sm mr-2`}></i>
                {category.name}
              </button>
            ))}
          </div>

          {/* FAQ Items */}
          <div className="space-y-3">
            {faqData[activeCategory as keyof typeof faqData]?.map((faq) => (
              <div key={faq.id} className="border border-gray-100 rounded-xl overflow-hidden">
                <button
                  onClick={() => toggleFAQ(faq.id)}
                  className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-gray-800 pr-4">{faq.question}</p>
                    <i className={`ri-arrow-${expandedFAQ === faq.id ? 'up' : 'down'}-s-line text-gray-400 text-lg flex-shrink-0`}></i>
                  </div>
                </button>
                {expandedFAQ === faq.id && (
                  <div className="px-4 pb-4 text-sm text-gray-600 border-t border-gray-100 bg-gray-50">
                    <div className="pt-3">
                      {faq.answer}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Enviar Consulta</h2>
          
          <form onSubmit={handleContactSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                <input
                  type="text"
                  value={contactForm.name}
                  onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Tu nombre"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="tu@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
              <select
                value={contactForm.category}
                onChange={(e) => setContactForm({...contactForm, category: e.target.value})}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="general">Consulta General</option>
                <option value="food">Problemas con Comidas</option>
                <option value="workout">Problemas con Ejercicios</option>
                <option value="progress">Problemas con Progreso</option>
                <option value="account">Problemas de Cuenta</option>
                <option value="bug">Reportar Error</option>
                <option value="feature">Solicitar Función</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mensaje</label>
              <textarea
                value={contactForm.message}
                onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                placeholder="Describe tu consulta o problema en detalle..."
                maxLength={500}
                required
              ></textarea>
              <p className="text-xs text-gray-500 mt-1">{contactForm.message.length}/500 caracteres</p>
            </div>

            <button
              type="submit"
              className="w-full bg-purple-500 text-white py-3 rounded-xl font-medium hover:bg-purple-600 transition-colors"
            >
              Enviar Consulta
            </button>
          </form>
        </div>

        {/* Additional Resources */}
        <div className="mt-6 bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Recursos Adicionales</h3>
          <div className="space-y-3">
            <Link href="#" className="flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <i className="ri-book-line text-blue-600 text-lg"></i>
                </div>
                <div>
                  <p className="font-medium text-gray-800">Guía de Usuario</p>
                  <p className="text-sm text-gray-600">Manual completo de la aplicación</p>
                </div>
              </div>
              <i className="ri-arrow-right-s-line text-gray-400"></i>
            </Link>

            <Link href="#" className="flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                  <i className="ri-file-text-line text-orange-600 text-lg"></i>
                </div>
                <div>
                  <p className="font-medium text-gray-800">Términos de Servicio</p>
                  <p className="text-sm text-gray-600">Condiciones de uso</p>
                </div>
              </div>
              <i className="ri-arrow-right-s-line text-gray-400"></i>
            </Link>

            <Link href="#" className="flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                  <i className="ri-shield-check-line text-green-600 text-lg"></i>
                </div>
                <div>
                  <p className="font-medium text-gray-800">Política de Privacidad</p>
                  <p className="text-sm text-gray-600">Cómo protegemos tus datos</p>
                </div>
              </div>
              <i className="ri-arrow-right-s-line text-gray-400"></i>
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 w-full bg-white border-t border-gray-100 px-0 py-0">
        <div className="grid grid-cols-5 h-16">
          <Link href="/" className="flex flex-col items-center justify-center">
            <i className="ri-home-line text-gray-400 text-lg"></i>
            <span className="text-xs text-gray-400 mt-1">Inicio</span>
          </Link>
          <Link href="/food" className="flex flex-col items-center justify-center">
            <i className="ri-restaurant-line text-gray-400 text-lg"></i>
            <span className="text-xs text-gray-400 mt-1">Comida</span>
          </Link>
          <Link href="/workout" className="flex flex-col items-center justify-center">
            <i className="ri-run-line text-gray-400 text-lg"></i>
            <span className="text-xs text-gray-400 mt-1">Ejercicio</span>
          </Link>
          <Link href="/progress" className="flex flex-col items-center justify-center">
            <i className="ri-bar-chart-line text-gray-400 text-lg"></i>
            <span className="text-xs text-gray-400 mt-1">Progreso</span>
          </Link>
          <Link href="/profile" className="flex flex-col items-center justify-center bg-purple-50">
            <i className="ri-user-fill text-purple-600 text-lg"></i>
            <span className="text-xs text-purple-600 mt-1">Perfil</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
