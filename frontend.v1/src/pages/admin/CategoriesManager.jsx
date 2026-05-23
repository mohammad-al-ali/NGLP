import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import PageFrame from '../../components/ui/PageFrame';
import TextField from '../../components/ui/TextField';
import { categories as defaultCategories, normalizeCategory } from '../../utils/constants';

export default function CategoriesManager() {
  const [items, setItems] = useState(defaultCategories);
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState('');
  const [loading, setLoading] = useState(true);

  const tree = useMemo(() => buildCategoryTree(items), [items]);

  useEffect(() => {
    let isMounted = true;

    async function loadCategories() {
      try {
        setLoading(true);
        const rootResponse = await api.get('/categories/root');
        const rootCategories = rootResponse.data.map((category) => normalizeCategory(category));
        
        const childResponses = await Promise.all(
          rootCategories.map((category) => api.get(`/categories/${category.id}/sub`).catch(() => ({ data: [] })))
        );
        const childCategories = childResponses.flatMap((response, index) =>
          response.data.map((category) => normalizeCategory(category, rootCategories[index].id))
        );

        if (isMounted) {
          if (rootCategories.length > 0) {
            setItems([...rootCategories, ...childCategories]);
          }
          setLoading(false);
        }
      } catch (err) {
        console.warn('Failed to load categories tree. Falling back to default list.', err);
        if (isMounted) {
          setItems(defaultCategories);
          setLoading(false);
        }
      }
    }

    loadCategories();
    return () => {
      isMounted = false;
    };
  }, []);

  async function addCategory(event) {
    event.preventDefault();
    if (!name.trim()) return;
    
    const nextCategory = { 
      id: Date.now(), 
      name: name.trim(), 
      parentId: parentId ? Number(parentId) : null 
    };
    
    try {
      const response = await api.post('/categories', {
        name: nextCategory.name,
        parent: nextCategory.parentId ? { id: nextCategory.parentId } : null,
      });
      setItems((current) => [...current, normalizeCategory(response.data, nextCategory.parentId)]);
    } catch (err) {
      console.warn('Could not post category to backend. Storing locally as draft.', err);
      setItems((current) => [...current, nextCategory]);
    }
    
    setName('');
    setParentId('');
  }

  async function deleteCategory(id) {
    try {
      await api.delete(`/categories/${id}`);
    } catch (err) {
      console.warn('Delete category request failed. Modifying local tree.', err);
    }
    setItems((current) => current.filter((item) => item.id !== id && item.parentId !== id));
  }

  async function renameCategory(category, nextName) {
    try {
      await api.put(`/categories/${category.id}`, {
        name: nextName,
        parent: category.parentId ? { id: category.parentId } : null,
      });
    } catch (err) {
      console.warn('Rename category request failed. Local update applied.', err);
    }
    setItems((current) => current.map((item) => 
      item.id === category.id ? { ...item, name: nextName } : item
    ));
  }

  return (
    <PageFrame 
      eyebrow="Admin Panel" 
      title="Categories Manager" 
      actions={
        <Link 
          className="secondary-button" 
          to="/admin/users"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            minHeight: '38px',
            padding: '0 16px',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            fontWeight: '600',
            fontSize: '0.85rem',
            backgroundColor: 'var(--surface)',
            color: 'var(--text-main)'
          }}
        >
          Users Management
        </Link>
      }
    >
      <div 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
          gap: '30px',
          alignItems: 'start'
        }}
      >
        {/* Create Category Panel */}
        <form 
          onSubmit={addCategory}
          className="premium-card"
          style={{
            padding: '28px',
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px'
          }}
        >
          <h2 style={{ fontSize: '1.25rem', fontWeight: '800', fontFamily: 'var(--font-display)', color: 'var(--text-main)' }}>
            New Category
          </h2>
          
          <TextField 
            label="Category Name" 
            value={name} 
            onChange={setName} 
            placeholder="e.g. Kotlin Foundations"
          />
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ color: 'var(--text-main)', fontSize: '0.875rem', fontWeight: '600' }}>
              Parent Category
            </label>
            <select 
              value={parentId} 
              onChange={(event) => setParentId(event.target.value)}
              style={{
                width: '100%',
                minHeight: '42px',
                padding: '0 12px',
                fontSize: '0.95rem',
                color: 'var(--text-main)',
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                outline: 'none',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <option value="">Root Category</option>
              {items.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
          </div>
          
          <button 
            className="primary-button" 
            type="submit"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '42px',
              backgroundColor: 'var(--primary)',
              color: 'var(--text-inverse)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.15)'
            }}
          >
            Create Category
          </button>
        </form>

        {/* Tree View Category Outline */}
        <div 
          className="premium-card"
          style={{
            padding: '28px',
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)'
          }}
        >
          <h2 style={{ fontSize: '1.25rem', fontWeight: '800', fontFamily: 'var(--font-display)', color: 'var(--text-main)', marginBottom: '20px' }}>
            Categories Tree Hierarchy
          </h2>
          
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[1, 2].map((n) => (
                <div key={n} style={{ height: '40px', backgroundColor: 'var(--bg)', borderRadius: 'var(--radius-md)' }} className="animate-pulse" />
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {tree.map((category) => (
                <CategoryNode 
                  key={category.id} 
                  category={category} 
                  onDelete={deleteCategory} 
                  onRename={renameCategory} 
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </PageFrame>
  );
}

function CategoryNode({ category, onDelete, onRename }) {
  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState(category.name);

  function saveLabel() {
    onRename(category, label.trim() || category.name);
    setEditing(false);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
      <div 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          padding: '8px 12px',
          backgroundColor: 'var(--bg)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)'
        }}
      >
        {editing ? (
          <input 
            value={label} 
            onChange={(event) => setLabel(event.target.value)} 
            style={{
              padding: '4px 8px',
              fontSize: '0.85rem',
              border: '1px solid var(--border)',
              borderRadius: '4px',
              backgroundColor: 'white',
              color: 'var(--text-main)',
              outline: 'none'
            }}
          />
        ) : (
          <strong style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-main)' }}>
            {label}
          </strong>
        )}
        
        <div style={{ display: 'flex', gap: '6px' }}>
          <button 
            onClick={editing ? saveLabel : () => setEditing(true)}
            style={{
              minHeight: '26px',
              padding: '0 8px',
              fontSize: '0.75rem',
              fontWeight: '700',
              borderRadius: '4px',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--surface)',
              color: 'var(--primary)',
              cursor: 'pointer'
            }}
          >
            {editing ? 'Save' : 'Rename'}
          </button>
          <button 
            onClick={() => onDelete(category.id)}
            style={{
              minHeight: '26px',
              padding: '0 8px',
              fontSize: '0.75rem',
              fontWeight: '700',
              borderRadius: '4px',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--surface)',
              color: 'var(--error)',
              cursor: 'pointer'
            }}
          >
            Delete
          </button>
        </div>
      </div>
      
      {category.children.length > 0 && (
        <div 
          style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '8px', 
            paddingLeft: '18px', 
            borderLeft: '1px dashed var(--border)',
            marginLeft: '10px'
          }}
        >
          {category.children.map((child) => (
            <CategoryNode 
              key={child.id} 
              category={child} 
              onDelete={onDelete} 
              onRename={onRename} 
            />
          ))}
        </div>
      )}
    </div>
  );
}

function buildCategoryTree(items) {
  const byId = new Map(items.map((item) => [item.id, { ...item, children: [] }]));
  const roots = [];
  byId.forEach((item) => {
    if (item.parentId && byId.has(item.parentId)) {
      byId.get(item.parentId).children.push(item);
    } else {
      roots.push(item);
    }
  });
  return roots;
}
