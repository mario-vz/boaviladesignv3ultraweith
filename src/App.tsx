import { Instagram, Mail, Menu, X, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase, Product } from './lib/supabase';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
    loadProducts();
    handleRouting();
  }, []);

  const handleRouting = () => {
    if (window.location.pathname === '/admin') {
      window.history.replaceState({}, '', '/');
      setShowAdminLogin(true);
    }
  };

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setIsAdmin(!!session);
  };

  const loadProducts = async () => {
    try {
      const { data } = await supabase
        .from('products')
        .select('*')
        .order('order_position', { ascending: true });

      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = () => {
    setIsAdmin(true);
    setShowAdminLogin(false);
  };

  const handleLogout = () => {
    setIsAdmin(false);
  };

  if (showAdminLogin) {
    return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
  }

  if (isAdmin) {
    return <AdminDashboard onLogout={handleLogout} />;
  }

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="fixed top-0 left-0 right-0 bg-white z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="text-xl font-light tracking-widest text-gray-900 uppercase">
            Boa Vila Design
          </div>

          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <nav className="hidden md:flex gap-12 items-center">
            <button
              onClick={() => scrollToSection('coleccion')}
              className="text-gray-700 hover:text-gray-900 transition-colors font-light text-sm tracking-wide"
            >
              Colección
            </button>
            <button
              onClick={() => scrollToSection('sobre')}
              className="text-gray-700 hover:text-gray-900 transition-colors font-light text-sm tracking-wide"
            >
              Sobre
            </button>
            <button
              onClick={() => scrollToSection('contacto')}
              className="text-gray-700 hover:text-gray-900 transition-colors font-light text-sm tracking-wide"
            >
              Contacto
            </button>
          </nav>
        </div>

        {isMenuOpen && (
          <nav className="md:hidden bg-white border-t border-gray-100 py-6">
            <div className="flex flex-col gap-6 px-6">
              <button
                onClick={() => scrollToSection('coleccion')}
                className="text-gray-700 hover:text-gray-900 transition-colors font-light text-left tracking-wide"
              >
                Colección
              </button>
              <button
                onClick={() => scrollToSection('sobre')}
                className="text-gray-700 hover:text-gray-900 transition-colors font-light text-left tracking-wide"
              >
                Sobre
              </button>
              <button
                onClick={() => scrollToSection('contacto')}
                className="text-gray-700 hover:text-gray-900 transition-colors font-light text-left tracking-wide"
              >
                Contacto
              </button>
            </div>
          </nav>
        )}
      </header>

      <main className="pt-20">
        <section
          className="h-[90vh] w-full bg-cover bg-center bg-no-repeat relative"
          style={{
            backgroundImage: "url('https://i.imgur.com/dU9xq3A.jpeg')",
          }}
        >
          {/* capa oscura para mejorar contraste */}
          <div className="absolute inset-0 bg-black/40"></div>

          {/* contenido centrado */}
          <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
            <h1 className="text-6xl md:text-7xl font-light text-white leading-tight tracking-tight">
              Artesanía Gallega
            </h1>

            <p className="text-xl text-gray-200 font-light leading-relaxed max-w-3xl mt-6">
              Piezas únicas diseñadas y elaboradas a mano en Galicia. Cada accesorio cuenta una historia de dedicación y precisión.
            </p>

            <button
              onClick={() => scrollToSection('coleccion')}
              className="mt-10 inline-flex items-center gap-3 px-8 py-4 border border-white text-white hover:bg-white hover:text-gray-900 transition-all duration-300 font-light tracking-wide text-sm"
            >
              Descubre la colección
              <ChevronDown size={18} className="rotate-90" />
            </button>
          </div>
        </section>

        <section id="coleccion" className="py-32 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-5xl font-light text-gray-900 mb-6 tracking-tight">
                Colección
              </h2>
              <p className="text-lg text-gray-600 font-light max-w-2xl mx-auto">
                Cada pieza es una creación artesanal única, elaborada con materiales cuidadosamente seleccionados.
              </p>
            </div>

            {loading ? (
              <div className="text-center py-20 text-gray-500 font-light">Cargando colección...</div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="group cursor-pointer"
                    onMouseEnter={() => setHoveredProduct(product.id)}
                    onMouseLeave={() => setHoveredProduct(null)}
                  >
                    <div className="relative overflow-hidden bg-gray-100 aspect-square mb-6">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <span className="text-sm">Sin imagen</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-lg font-light text-gray-900 tracking-wide">
                        {product.title}
                      </h3>
                      <p className="text-sm text-gray-600 font-light leading-relaxed h-12 overflow-hidden">
                        {product.description}
                      </p>

                      {hoveredProduct === product.id && (
                        <a
                          href={product.instagram_link || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-6 py-3 border border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white transition-all duration-300 font-light text-sm tracking-wide mt-4"
                        >
                          Ver en Instagram
                          <ChevronDown size={16} className="rotate-90" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 text-gray-500 font-light">
                Colección próximamente disponible.
              </div>
            )}
          </div>
        </section>

        <section 
          id="sobre"
          className="py-32 px-6 bg-cover bg-center bg-no-repeat relative"
          style={{
            backgroundImage: "url('https://i.imgur.com/EO2Pi0t.jpeg')", // tu imagen
          }}
        >
          {/* Capa oscura para que el texto siga siendo legible */}
          <div className="absolute inset-0 bg-black/30"></div>

          <div className="relative z-10 max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">

              {/* Imagen actual dentro de la caja cuadrada */}
              <div>
                <div className="aspect-square bg-white/20 rounded-lg overflow-hidden backdrop-blur-sm">
                  <img
                    src="https://i.imgur.com/9iBaAZi.png"
                    alt="Fotografía artesana"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Texto */}
              <div className="space-y-8 text-white">
                <div>
                  <h2 className="text-5xl font-light mb-6 tracking-tight">
                    Sobre Boa Vila Design
                  </h2>
                </div>

                <div className="space-y-6 font-light leading-relaxed">
                  <p>
                    Boa Vila Design nace del amor por la artesanía gallega y la pasión
                    por crear piezas únicas. Cada accesorio es elaborado a mano con
                    materiales cuidadosamente seleccionados.
                  </p>

                  <p>
                    Creemos que la verdadera belleza reside en los detalles. Por eso,
                    dedicamos tiempo y atención a cada creación, asegurando que cumple
                    con nuestros estándares de calidad y diseño.
                  </p>

                  <p>
                    Nuestro objetivo es ofrecer accesorios que no solo sean hermosos,
                    sino que también cuenten una historia de tradición, técnica y
                    dedicación.
                  </p>
                </div>

                <div className="pt-4 space-y-3">
                  <h3 className="text-sm font-light tracking-wide uppercase">
                    Valores
                  </h3>
                  <ul className="space-y-2 text-sm font-light">
                    <li>Artesanía de calidad</li>
                    <li>Diseño contemporáneo</li>
                    <li>Materiales seleccionados</li>
                    <li>Sostenibilidad</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-32 px-6 bg-white">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-50 p-16 text-center space-y-6">
              <h2 className="text-4xl font-light text-gray-900 tracking-tight">
                Proceso Artesanal
              </h2>
              <p className="text-lg text-gray-600 font-light">
                Cada pieza es creada a través de un proceso cuidadoso que combina técnica tradicional con diseño contemporáneo.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
                {[
                  { step: 'Diseño', desc: 'Conceptualización única de cada pieza' },
                  { step: 'Elaboración', desc: 'Trabajo manual y dedicado' },
                  { step: 'Acabado', desc: 'Control de calidad exhaustivo' }
                ].map((item, idx) => (
                  <div key={idx} className="space-y-3">
                    <div className="text-4xl font-light text-gray-900 opacity-30">
                      {idx + 1}
                    </div>
                    <h3 className="text-lg font-light text-gray-900 tracking-wide">
                      {item.step}
                    </h3>
                    <p className="text-sm text-gray-600 font-light">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="contacto" className="py-32 px-6 bg-gray-50">
          <div className="max-w-2xl mx-auto text-center space-y-12">
            <div className="space-y-4">
              <h2 className="text-5xl font-light text-gray-900 tracking-tight">
                Conecta con nosotros
              </h2>
              <p className="text-lg text-gray-600 font-light">
                Conoce más sobre nuestras creaciones y cómo hacer tu pedido.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-8 justify-center items-center">
              <a
                href="#"
                className="flex items-center gap-3 px-8 py-4 border border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white transition-all duration-300 font-light tracking-wide text-sm group"
              >
                <Instagram size={20} />
                <span>@boaviladesign</span>
              </a>

              <a
                href="mailto:contacto@boaviladesign.com"
                className="flex items-center gap-3 px-8 py-4 border border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white transition-all duration-300 font-light tracking-wide text-sm group"
              >
                <Mail size={20} />
                <span>Correo</span>
              </a>
            </div>
          </div>
        </section>

        <section className="py-16 px-6 bg-white border-t border-gray-100">
          <div className="max-w-7xl mx-auto text-center">
            <p className="text-gray-600 font-light text-sm">
              © {new Date().getFullYear()} Boa Vila Design. Diseño artesanal hecho a mano en Galicia.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
