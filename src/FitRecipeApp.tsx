import React, { useState, useCallback, useEffect, useRef } from 'react';
import './FitRecipeApp.css';

// Types
interface Recipe {
  id: string;
  name: string;
  ingredients: string[];
  instructions: string[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  prepTime: number;
  cookTime: number;
  servings: number;
  createdAt: string;
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

interface RecipeHistory {
  id: string;
  recipe: Recipe;
  viewedAt: string;
  rating?: number;
  notes?: string;
}

interface SecureBackendConfig {
  apiUrl: string;
  token?: string;
  timeout: number;
}

interface NutritionFilters {
  minCalories?: number;
  maxCalories?: number;
  minProtein?: number;
  maxProtein?: number;
}

// API Service with secure backend integration
class SecureRecipeAPI {
  private config: SecureBackendConfig;
  private requestQueue: Array<() => Promise<any>> = [];
  private isProcessing = false;

  constructor(config: SecureBackendConfig) {
    this.config = config;
  }

  private async executeQueue() {
    if (this.isProcessing || this.requestQueue.length === 0) return;
    this.isProcessing = true;

    while (this.requestQueue.length > 0) {
      const request = this.requestQueue.shift();
      if (request) {
        try {
          await request();
        } catch (error) {
          console.error('Queue request failed:', error);
        }
      }
    }
    this.isProcessing = false;
  }

  private async makeSecureRequest(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    data?: any
  ): Promise<any> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'X-Client-Version': '1.0.0',
      };

      if (this.config.token) {
        headers['Authorization'] = `Bearer ${this.config.token}`;
      }

      const response = await fetch(`${this.config.apiUrl}${endpoint}`, {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined,
        signal: controller.signal,
        credentials: 'include',
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timeout');
        }
        throw error;
      }
      throw new Error('Unknown error occurred');
    }
  }

  async getRecipes(filters?: NutritionFilters): Promise<Recipe[]> {
    const query = new URLSearchParams();
    if (filters) {
      if (filters.minCalories) query.append('minCalories', filters.minCalories.toString());
      if (filters.maxCalories) query.append('maxCalories', filters.maxCalories.toString());
      if (filters.minProtein) query.append('minProtein', filters.minProtein.toString());
      if (filters.maxProtein) query.append('maxProtein', filters.maxProtein.toString());
    }
    return this.makeSecureRequest(`/api/recipes?${query.toString()}`);
  }

  async getRecipeById(id: string): Promise<Recipe> {
    return this.makeSecureRequest(`/api/recipes/${id}`);
  }

  async createRecipe(recipe: Omit<Recipe, 'id' | 'createdAt'>): Promise<Recipe> {
    return this.makeSecureRequest('/api/recipes', 'POST', recipe);
  }

  async updateRecipe(id: string, updates: Partial<Recipe>): Promise<Recipe> {
    return this.makeSecureRequest(`/api/recipes/${id}`, 'PUT', updates);
  }

  async deleteRecipe(id: string): Promise<void> {
    return this.makeSecureRequest(`/api/recipes/${id}`, 'DELETE');
  }

  async getRecipeHistory(): Promise<RecipeHistory[]> {
    return this.makeSecureRequest('/api/recipe-history');
  }

  async addToHistory(recipeId: string): Promise<RecipeHistory> {
    return this.makeSecureRequest('/api/recipe-history', 'POST', { recipeId });
  }

  async rateRecipe(historyId: string, rating: number, notes?: string): Promise<RecipeHistory> {
    return this.makeSecureRequest(`/api/recipe-history/${historyId}`, 'PUT', { rating, notes });
  }

  queueRequest(request: () => Promise<any>): void {
    this.requestQueue.push(request);
    this.executeQueue();
  }
}

// Toast Component
const ToastContainer: React.FC<{ toasts: Toast[]; onRemove: (id: string) => void }> = ({
  toasts,
  onRemove,
}) => (
  <div className="toast-container">
    {toasts.map((toast) => (
      <div key={toast.id} className={`toast toast-${toast.type}`}>
        <div className="toast-content">
          <span className={`toast-icon toast-icon-${toast.type}`}>
            {toast.type === 'success' && '✓'}
            {toast.type === 'error' && '✕'}
            {toast.type === 'info' && 'ℹ'}
            {toast.type === 'warning' && '⚠'}
          </span>
          <span className="toast-message">{toast.message}</span>
        </div>
        <button
          className="toast-close"
          onClick={() => onRemove(toast.id)}
          aria-label="Close notification"
        >
          ×
        </button>
      </div>
    ))}
  </div>
);

// Main Component
const FitRecipeApp: React.FC = () => {
  // State Management
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [recipeHistory, setRecipeHistory] = useState<RecipeHistory[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('fitrecipe-darkmode');
    return saved ? JSON.parse(saved) : false;
  });
  const [loading, setLoading] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [nutritionFilters, setNutritionFilters] = useState<NutritionFilters>({});
  const [showHistory, setShowHistory] = useState(false);
  const [showNewRecipeForm, setShowNewRecipeForm] = useState(false);

  const apiRef = useRef<SecureRecipeAPI | null>(null);

  // Initialize API
  useEffect(() => {
    const apiConfig: SecureBackendConfig = {
      apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:3001',
      token: localStorage.getItem('auth-token') || undefined,
      timeout: 10000,
    };
    apiRef.current = new SecureRecipeAPI(apiConfig);
  }, []);

  // Apply dark mode to DOM
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    localStorage.setItem('fitrecipe-darkmode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  // Toast Management
  const addToast = useCallback((
    message: string,
    type: 'success' | 'error' | 'info' | 'warning' = 'info',
    duration = 3000
  ) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast: Toast = { id, message, type, duration };
    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Data Fetching
  const fetchRecipes = useCallback(async () => {
    if (!apiRef.current) return;
    setLoading(true);
    try {
      const data = await apiRef.current.getRecipes(nutritionFilters);
      setRecipes(data);
      addToast('Recipes loaded successfully', 'success');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load recipes';
      addToast(message, 'error');
      console.error('Error fetching recipes:', error);
    } finally {
      setLoading(false);
    }
  }, [nutritionFilters, addToast]);

  const fetchRecipeHistory = useCallback(async () => {
    if (!apiRef.current) return;
    try {
      const data = await apiRef.current.getRecipeHistory();
      setRecipeHistory(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load history';
      addToast(message, 'error');
      console.error('Error fetching history:', error);
    }
  }, [addToast]);

  // Load recipes on mount
  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  // Recipe Selection and History
  const handleSelectRecipe = useCallback(
    async (recipe: Recipe) => {
      setSelectedRecipe(recipe);
      if (!apiRef.current) return;

      try {
        await apiRef.current.addToHistory(recipe.id);
        await fetchRecipeHistory();
      } catch (error) {
        console.error('Error adding to history:', error);
      }
    },
    [fetchRecipeHistory]
  );

  // Rating Handler
  const handleRateRecipe = useCallback(
    async (historyId: string, rating: number, notes?: string) => {
      if (!apiRef.current) return;
      try {
        await apiRef.current.rateRecipe(historyId, rating, notes);
        await fetchRecipeHistory();
        addToast('Recipe rated successfully', 'success');
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to rate recipe';
        addToast(message, 'error');
      }
    },
    [fetchRecipeHistory, addToast]
  );

  // Delete Recipe Handler
  const handleDeleteRecipe = useCallback(
    async (recipeId: string) => {
      if (!apiRef.current) return;
      if (!window.confirm('Are you sure you want to delete this recipe?')) return;

      try {
        await apiRef.current.deleteRecipe(recipeId);
        setRecipes((prev) => prev.filter((r) => r.id !== recipeId));
        setSelectedRecipe(null);
        addToast('Recipe deleted successfully', 'success');
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to delete recipe';
        addToast(message, 'error');
      }
    },
    [addToast]
  );

  // Create Recipe Handler
  const handleCreateRecipe = useCallback(
    async (recipe: Omit<Recipe, 'id' | 'createdAt'>) => {
      if (!apiRef.current) return;
      try {
        const newRecipe = await apiRef.current.createRecipe(recipe);
        setRecipes((prev) => [...prev, newRecipe]);
        setShowNewRecipeForm(false);
        addToast('Recipe created successfully', 'success');
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to create recipe';
        addToast(message, 'error');
      }
    },
    [addToast]
  );

  // Filter Recipes
  const filteredRecipes = recipes.filter((recipe) => {
    const query = searchQuery.toLowerCase();
    return (
      recipe.name.toLowerCase().includes(query) ||
      recipe.ingredients.some((ing) => ing.toLowerCase().includes(query))
    );
  });

  return (
    <div className="fit-recipe-app" data-testid="fit-recipe-app">
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">🥗 FitRecipeApp</h1>
          <div className="header-actions">
            <button
              className="btn btn-secondary"
              onClick={() => setIsDarkMode(!isDarkMode)}
              aria-label="Toggle dark mode"
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => {
                setShowHistory(!showHistory);
                if (!showHistory) fetchRecipeHistory();
              }}
              aria-label="View recipe history"
            >
              📋 History {recipeHistory.length > 0 && `(${recipeHistory.length})`}
            </button>
            <button
              className="btn btn-primary"
              onClick={() => setShowNewRecipeForm(!showNewRecipeForm)}
            >
              ➕ New Recipe
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="app-main">
        <div className="container">
          {showHistory ? (
            // History View
            <section className="history-section">
              <h2>Recipe History</h2>
              {recipeHistory.length === 0 ? (
                <p className="empty-state">No recipe history yet. Start exploring recipes!</p>
              ) : (
                <div className="history-grid">
                  {recipeHistory.map((entry) => (
                    <div key={entry.id} className="history-card">
                      <h3>{entry.recipe.name}</h3>
                      <p className="recipe-meta">
                        Viewed: {new Date(entry.viewedAt).toLocaleDateString()}
                      </p>
                      {entry.rating && (
                        <div className="rating">
                          ⭐ {entry.rating}/5
                          {entry.notes && <p className="notes">{entry.notes}</p>}
                        </div>
                      )}
                      <button
                        className="btn btn-secondary"
                        onClick={() => {
                          setSelectedRecipe(entry.recipe);
                          setShowHistory(false);
                        }}
                      >
                        View Recipe
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          ) : showNewRecipeForm ? (
            // New Recipe Form
            <NewRecipeForm
              onSubmit={handleCreateRecipe}
              onCancel={() => setShowNewRecipeForm(false)}
            />
          ) : selectedRecipe ? (
            // Recipe Detail View
            <RecipeDetail
              recipe={selectedRecipe}
              onBack={() => setSelectedRecipe(null)}
              onDelete={handleDeleteRecipe}
              onRate={handleRateRecipe}
              historyEntry={recipeHistory.find((h) => h.recipe.id === selectedRecipe.id)}
            />
          ) : (
            // Recipes List View
            <>
              <section className="search-section">
                <input
                  type="text"
                  placeholder="Search recipes or ingredients..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
              </section>

              <section className="filters-section">
                <div className="filter-group">
                  <label htmlFor="maxCalories">Max Calories:</label>
                  <input
                    id="maxCalories"
                    type="number"
                    placeholder="e.g., 500"
                    onChange={(e) =>
                      setNutritionFilters((prev) => ({
                        ...prev,
                        maxCalories: e.target.value ? parseInt(e.target.value) : undefined,
                      }))
                    }
                    className="filter-input"
                  />
                </div>
                <div className="filter-group">
                  <label htmlFor="minProtein">Min Protein (g):</label>
                  <input
                    id="minProtein"
                    type="number"
                    placeholder="e.g., 20"
                    onChange={(e) =>
                      setNutritionFilters((prev) => ({
                        ...prev,
                        minProtein: e.target.value ? parseInt(e.target.value) : undefined,
                      }))
                    }
                    className="filter-input"
                  />
                </div>
                <button className="btn btn-secondary" onClick={fetchRecipes}>
                  Apply Filters
                </button>
              </section>

              {loading ? (
                <div className="loading">Loading recipes...</div>
              ) : filteredRecipes.length === 0 ? (
                <p className="empty-state">No recipes found. Try adjusting your search or filters.</p>
              ) : (
                <section className="recipes-grid">
                  {filteredRecipes.map((recipe) => (
                    <RecipeCard
                      key={recipe.id}
                      recipe={recipe}
                      onClick={() => handleSelectRecipe(recipe)}
                    />
                  ))}
                </section>
              )}
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p>&copy; 2025 FitRecipeApp. Healthy eating made easy. 🍎</p>
      </footer>
    </div>
  );
};

// Recipe Card Component
const RecipeCard: React.FC<{ recipe: Recipe; onClick: () => void }> = ({ recipe, onClick }) => (
  <div className="recipe-card" onClick={onClick} role="button" tabIndex={0} onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') onClick();
  }}>
    <h3>{recipe.name}</h3>
    <div className="nutrition-summary">
      <span>🔥 {recipe.calories} cal</span>
      <span>💪 {recipe.protein}g protein</span>
      <span>⏱️ {recipe.prepTime + recipe.cookTime} min</span>
    </div>
    <button className="btn btn-secondary" onClick={(e) => {
      e.stopPropagation();
      onClick();
    }}>
      View Details
    </button>
  </div>
);

// Recipe Detail Component
interface RecipeDetailProps {
  recipe: Recipe;
  onBack: () => void;
  onDelete: (id: string) => void;
  onRate: (historyId: string, rating: number, notes?: string) => void;
  historyEntry?: RecipeHistory;
}

const RecipeDetail: React.FC<RecipeDetailProps> = ({
  recipe,
  onBack,
  onDelete,
  onRate,
  historyEntry,
}) => {
  const [rating, setRating] = useState(historyEntry?.rating || 0);
  const [notes, setNotes] = useState(historyEntry?.notes || '');

  return (
    <section className="recipe-detail">
      <button className="btn btn-secondary" onClick={onBack}>
        ← Back
      </button>

      <h2>{recipe.name}</h2>

      <div className="recipe-meta">
        <div className="meta-item">
          <strong>Prep Time:</strong> {recipe.prepTime} min
        </div>
        <div className="meta-item">
          <strong>Cook Time:</strong> {recipe.cookTime} min
        </div>
        <div className="meta-item">
          <strong>Servings:</strong> {recipe.servings}
        </div>
      </div>

      <div className="nutrition-facts">
        <h3>Nutrition Facts (per serving)</h3>
        <div className="nutrition-grid">
          <div className="nutrition-item">
            <span className="label">Calories</span>
            <span className="value">{recipe.calories}</span>
          </div>
          <div className="nutrition-item">
            <span className="label">Protein</span>
            <span className="value">{recipe.protein}g</span>
          </div>
          <div className="nutrition-item">
            <span className="label">Carbs</span>
            <span className="value">{recipe.carbs}g</span>
          </div>
          <div className="nutrition-item">
            <span className="label">Fat</span>
            <span className="value">{recipe.fat}g</span>
          </div>
        </div>
      </div>

      <div className="recipe-section">
        <h3>Ingredients</h3>
        <ul className="ingredients-list">
          {recipe.ingredients.map((ingredient, idx) => (
            <li key={idx}>{ingredient}</li>
          ))}
        </ul>
      </div>

      <div className="recipe-section">
        <h3>Instructions</h3>
        <ol className="instructions-list">
          {recipe.instructions.map((instruction, idx) => (
            <li key={idx}>{instruction}</li>
          ))}
        </ol>
      </div>

      {historyEntry && (
        <div className="recipe-section rating-section">
          <h3>Your Rating</h3>
          <div className="rating-input">
            <div className="star-rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  className={`star ${star <= rating ? 'filled' : ''}`}
                  onClick={() => setRating(star)}
                  aria-label={`Rate ${star} stars`}
                >
                  ⭐
                </button>
              ))}
            </div>
            <textarea
              placeholder="Add your notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="notes-input"
            />
            <button
              className="btn btn-primary"
              onClick={() => onRate(historyEntry.id, rating, notes)}
            >
              Save Rating
            </button>
          </div>
        </div>
      )}

      <div className="recipe-actions">
        <button className="btn btn-danger" onClick={() => onDelete(recipe.id)}>
          🗑️ Delete Recipe
        </button>
      </div>
    </section>
  );
};

// New Recipe Form Component
interface NewRecipeFormProps {
  onSubmit: (recipe: Omit<Recipe, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

const NewRecipeForm: React.FC<NewRecipeFormProps> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    ingredients: [''],
    instructions: [''],
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    prepTime: 0,
    cookTime: 0,
    servings: 1,
  });

  const handleIngredientChange = (idx: number, value: string) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[idx] = value;
    setFormData((prev) => ({ ...prev, ingredients: newIngredients }));
  };

  const handleInstructionChange = (idx: number, value: string) => {
    const newInstructions = [...formData.instructions];
    newInstructions[idx] = value;
    setFormData((prev) => ({ ...prev, instructions: newInstructions }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name: formData.name,
      ingredients: formData.ingredients.filter((i) => i.trim()),
      instructions: formData.instructions.filter((i) => i.trim()),
      calories: formData.calories,
      protein: formData.protein,
      carbs: formData.carbs,
      fat: formData.fat,
      prepTime: formData.prepTime,
      cookTime: formData.cookTime,
      servings: formData.servings,
    });
  };

  return (
    <section className="new-recipe-form">
      <h2>Create New Recipe</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Recipe Name *</label>
          <input
            id="name"
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>Ingredients *</label>
          {formData.ingredients.map((ingredient, idx) => (
            <div key={idx} className="form-array-item">
              <input
                type="text"
                placeholder={`Ingredient ${idx + 1}`}
                value={ingredient}
                onChange={(e) => handleIngredientChange(idx, e.target.value)}
                className="form-input"
              />
              {formData.ingredients.length > 1 && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      ingredients: prev.ingredients.filter((_, i) => i !== idx),
                    }))
                  }
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() =>
              setFormData((prev) => ({ ...prev, ingredients: [...prev.ingredients, ''] }))
            }
          >
            + Add Ingredient
          </button>
        </div>

        <div className="form-group">
          <label>Instructions *</label>
          {formData.instructions.map((instruction, idx) => (
            <div key={idx} className="form-array-item">
              <textarea
                placeholder={`Step ${idx + 1}`}
                value={instruction}
                onChange={(e) => handleInstructionChange(idx, e.target.value)}
                className="form-input"
                rows={2}
              />
              {formData.instructions.length > 1 && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      instructions: prev.instructions.filter((_, i) => i !== idx),
                    }))
                  }
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() =>
              setFormData((prev) => ({ ...prev, instructions: [...prev.instructions, ''] }))
            }
          >
            + Add Step
          </button>
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="calories">Calories (per serving) *</label>
            <input
              id="calories"
              type="number"
              required
              min="0"
              value={formData.calories}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, calories: parseInt(e.target.value) || 0 }))
              }
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label htmlFor="protein">Protein (g) *</label>
            <input
              id="protein"
              type="number"
              required
              min="0"
              step="0.1"
              value={formData.protein}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, protein: parseFloat(e.target.value) || 0 }))
              }
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label htmlFor="carbs">Carbs (g) *</label>
            <input
              id="carbs"
              type="number"
              required
              min="0"
              step="0.1"
              value={formData.carbs}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, carbs: parseFloat(e.target.value) || 0 }))
              }
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label htmlFor="fat">Fat (g) *</label>
            <input
              id="fat"
              type="number"
              required
              min="0"
              step="0.1"
              value={formData.fat}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, fat: parseFloat(e.target.value) || 0 }))
              }
              className="form-input"
            />
          </div>
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="prepTime">Prep Time (min) *</label>
            <input
              id="prepTime"
              type="number"
              required
              min="0"
              value={formData.prepTime}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, prepTime: parseInt(e.target.value) || 0 }))
              }
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label htmlFor="cookTime">Cook Time (min) *</label>
            <input
              id="cookTime"
              type="number"
              required
              min="0"
              value={formData.cookTime}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, cookTime: parseInt(e.target.value) || 0 }))
              }
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label htmlFor="servings">Servings *</label>
            <input
              id="servings"
              type="number"
              required
              min="1"
              value={formData.servings}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, servings: parseInt(e.target.value) || 1 }))
              }
              className="form-input"
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            Create Recipe
          </button>
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </section>
  );
};

export default FitRecipeApp;
