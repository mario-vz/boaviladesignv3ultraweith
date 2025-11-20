import { useState, useEffect } from 'react';
import { supabase, Product } from '../lib/supabase';
import { LogOut, Plus, Edit2, Trash2, Save, X } from 'lucide-react';

interface AdminDashboardProps {
  onLogout: () => void;
}

type ProductForm = {
  title: string;
  description: string;
  image_url: string;
  instagram_link: string;
  order_position: number;
};

const emptyForm: ProductForm = {
  title: '',
  description: '',
  image_url: '',
  instagram_link: '',
  order_position: 0,
};

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<ProductForm>(emptyForm);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('order_position', { ascending: true });

      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onLogout();
  };

  const startCreate = () => {
    setIsCreating(true);
    setFormData(emptyForm);
    setEditingId(null);
    setError('');
  };

  const startEdit = (product: Product) => {
    setEditingId(product.id);
    setFormData({
      title: product.title,
      description: product.description,
      image_url: product.image_url || '',
      instagram_link: product.instagram_link || '',
      order_position: product.order_position,
    });
    setIsCreating(false);
    setError('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsCreating(false);
    setFormData(emptyForm);
    setError('');
  };

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      setError('El nombre y la descripción son obligatorios');
      return;
    }

    try {
      if (isCreating) {
        const { error } = await supabase.from('products').insert([
          {
            title: formData.title,
            description: formData.description,
            image_url: formData.image_url || null,
            instagram_link: formData.instagram_link || null,
            order_position: formData.order_position,
          },
        ]);

        if (error) throw error;
      } else if (editingId) {
        const { error } = await supabase
          .from('products')
          .update({
            title: formData.title,
            description: formData.description,
            image_url: formData.image_url || null,
            instagram_link: formData.instagram_link || null,
            order_position: formData.order_position,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingId);

        if (error) throw error;
      }

      await loadProducts();
      cancelEdit();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar producto');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás segura de que quieres eliminar este producto?')) return;

    try {
      const { error } = await supabase.from('products').delete().eq('id', id);

      if (error) throw error;

      await loadProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar producto');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-gray-600 font-light">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-light text-gray-800">Panel de Administración</h1>
            <p className="text-sm text-gray-600 font-light">Boa Vila Design</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-emerald-500 transition-colors font-light"
          >
            <LogOut size={20} />
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-light text-gray-800">Productos</h2>
          {!isCreating && (
            <button
              onClick={startCreate}
              className="flex items-center gap-2 px-6 py-3 bg-emerald-400 text-white rounded-lg hover:bg-emerald-500 transition-colors font-light"
            >
              <Plus size={20} />
              Nuevo producto
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 font-light">
            {error}
          </div>
        )}

        {isCreating && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h3 className="text-xl font-light text-gray-800 mb-4">Crear nuevo producto</h3>
            <ProductFormFields formData={formData} setFormData={setFormData} />
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-6 py-3 bg-emerald-400 text-white rounded-lg hover:bg-emerald-500 transition-colors font-light"
              >
                <Save size={20} />
                Guardar
              </button>
              <button
                onClick={cancelEdit}
                className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-light"
              >
                <X size={20} />
                Cancelar
              </button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              {editingId === product.id ? (
                <div className="p-6">
                  <h3 className="text-xl font-light text-gray-800 mb-4">Editar producto</h3>
                  <ProductFormFields formData={formData} setFormData={setFormData} />
                  <div className="flex gap-3">
                    <button
                      onClick={handleSave}
                      className="flex items-center gap-2 px-6 py-3 bg-emerald-400 text-white rounded-lg hover:bg-emerald-500 transition-colors font-light"
                    >
                      <Save size={20} />
                      Guardar
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-light"
                    >
                      <X size={20} />
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-48 h-48 bg-gray-100 flex-shrink-0">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                        Sin imagen
                      </div>
                    )}
                  </div>
                  <div className="flex-1 p-6">
                    <h3 className="text-xl font-light text-gray-800 mb-2">{product.title}</h3>
                    <p className="text-gray-600 mb-4 font-light">{product.description}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500 font-light mb-4">
                      <span>Orden: {product.order_position}</span>
                      {product.instagram_link && (
                        <a
                          href={product.instagram_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-500 hover:text-emerald-600"
                        >
                          Ver en Instagram
                        </a>
                      )}
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => startEdit(product)}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-light"
                      >
                        <Edit2 size={18} />
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-light"
                      >
                        <Trash2 size={18} />
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {products.length === 0 && !isCreating && (
          <div className="text-center py-12 text-gray-500 font-light">
            No hay productos todavía. Haz clic en "Nuevo producto" para crear uno.
          </div>
        )}
      </main>
    </div>
  );
}

interface ProductFormFieldsProps {
  formData: ProductForm;
  setFormData: (data: ProductForm) => void;
}

function ProductFormFields({ formData, setFormData }: ProductFormFieldsProps) {
  return (
    <div className="space-y-4 mb-6">
      <div>
        <label className="block text-sm font-light text-gray-700 mb-2">
          Nombre del producto *
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-400 transition-colors font-light"
          placeholder="Ej: Pendientes Azul Artesanal"
        />
      </div>

      <div>
        <label className="block text-sm font-light text-gray-700 mb-2">
          Descripción *
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-400 transition-colors font-light"
          placeholder="Describe el producto..."
        />
      </div>

      <div>
        <label className="block text-sm font-light text-gray-700 mb-2">
          URL de la imagen
        </label>
        <input
          type="url"
          value={formData.image_url}
          onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-400 transition-colors font-light"
          placeholder="https://ejemplo.com/imagen.jpg"
        />
      </div>

      <div>
        <label className="block text-sm font-light text-gray-700 mb-2">
          Link de Instagram
        </label>
        <input
          type="url"
          value={formData.instagram_link}
          onChange={(e) => setFormData({ ...formData, instagram_link: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-400 transition-colors font-light"
          placeholder="https://instagram.com/..."
        />
      </div>

      <div>
        <label className="block text-sm font-light text-gray-700 mb-2">
          Orden de visualización
        </label>
        <input
          type="number"
          value={formData.order_position}
          onChange={(e) => setFormData({ ...formData, order_position: parseInt(e.target.value) || 0 })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-400 transition-colors font-light"
          placeholder="0"
        />
      </div>
    </div>
  );
}
