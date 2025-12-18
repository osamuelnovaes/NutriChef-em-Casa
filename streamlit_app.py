import streamlit as st
import json
import os
from datetime import datetime
from pathlib import Path
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go

# Page configuration
st.set_page_config(
    page_title="NutriChef em Casa",
    page_icon="🍽️",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS styling
st.markdown("""
    <style>
    .main {
        padding-top: 2rem;
    }
    .stTabs [data-baseweb="tab-list"] button [data-testid="stMarkdownContainer"] p {
        font-size: 1.2rem;
        font-weight: 600;
    }
    .metric-card {
        background-color: #f0f2f6;
        padding: 20px;
        border-radius: 10px;
        border-left: 5px solid #ff6b6b;
    }
    .recipe-card {
        background-color: #ffffff;
        padding: 20px;
        border-radius: 10px;
        border: 2px solid #e0e0e0;
        margin-bottom: 15px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .favorite-badge {
        display: inline-block;
        background-color: #ffd700;
        padding: 5px 10px;
        border-radius: 20px;
        font-size: 0.8rem;
        margin-left: 10px;
    }
    </style>
""", unsafe_allow_html=True)

# Data storage functions
def get_data_dir():
    """Get or create data directory"""
    data_dir = Path(".streamlit_data")
    data_dir.mkdir(exist_ok=True)
    return data_dir

def load_recipes():
    """Load recipes from JSON file"""
    data_dir = get_data_dir()
    recipes_file = data_dir / "recipes.json"
    if recipes_file.exists():
        with open(recipes_file, 'r', encoding='utf-8') as f:
            return json.load(f)
    return []

def save_recipes(recipes):
    """Save recipes to JSON file"""
    data_dir = get_data_dir()
    recipes_file = data_dir / "recipes.json"
    with open(recipes_file, 'w', encoding='utf-8') as f:
        json.dump(recipes, f, indent=2, ensure_ascii=False)

def load_favorites():
    """Load favorites from JSON file"""
    data_dir = get_data_dir()
    favorites_file = data_dir / "favorites.json"
    if favorites_file.exists():
        with open(favorites_file, 'r', encoding='utf-8') as f:
            return json.load(f)
    return []

def save_favorites(favorites):
    """Save favorites to JSON file"""
    data_dir = get_data_dir()
    favorites_file = data_dir / "favorites.json"
    with open(favorites_file, 'w', encoding='utf-8') as f:
        json.dump(favorites, f, indent=2, ensure_ascii=False)

def load_history():
    """Load recipe history from JSON file"""
    data_dir = get_data_dir()
    history_file = data_dir / "history.json"
    if history_file.exists():
        with open(history_file, 'r', encoding='utf-8') as f:
            return json.load(f)
    return []

def save_history(history):
    """Save recipe history to JSON file"""
    data_dir = get_data_dir()
    history_file = data_dir / "history.json"
    with open(history_file, 'w', encoding='utf-8') as f:
        json.dump(history, f, indent=2, ensure_ascii=False)

# Initialize session state
if 'recipes' not in st.session_state:
    st.session_state.recipes = load_recipes()
if 'favorites' not in st.session_state:
    st.session_state.favorites = load_favorites()
if 'history' not in st.session_state:
    st.session_state.history = load_history()

# Sidebar navigation
st.sidebar.title("🍽️ NutriChef em Casa")
st.sidebar.markdown("---")

menu_option = st.sidebar.radio(
    "Menu Principal",
    ["📊 Dashboard", "🥘 Gerar Receita", "⭐ Favoritos", "📜 Histórico", "ℹ️ Sobre"]
)

st.sidebar.markdown("---")
st.sidebar.markdown("""
### Recursos Principais
- ✨ Geração de receitas personalizadas
- 📊 Dashboard com estatísticas
- ⭐ Salve suas receitas favoritas
- 📜 Acesse seu histórico de consultas
- 🍽️ Dicas nutricionais
""")

# Helper functions for recipe management
def add_recipe(recipe_data):
    """Add a new recipe to the list"""
    recipe_data['id'] = datetime.now().isoformat()
    recipe_data['created_at'] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    st.session_state.recipes.append(recipe_data)
    save_recipes(st.session_state.recipes)
    
    # Add to history
    history_entry = {
        'recipe_name': recipe_data.get('name', 'Receita sem nome'),
        'timestamp': datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        'ingredients': recipe_data.get('ingredients', [])
    }
    st.session_state.history.append(history_entry)
    save_history(st.session_state.history)

def add_to_favorites(recipe_id, recipe_name):
    """Add recipe to favorites"""
    if recipe_id not in st.session_state.favorites:
        st.session_state.favorites.append(recipe_id)
        save_favorites(st.session_state.favorites)
        st.success(f"✅ {recipe_name} adicionado aos favoritos!")
    else:
        st.info(f"ℹ️ {recipe_name} já está nos favoritos")

def remove_from_favorites(recipe_id):
    """Remove recipe from favorites"""
    if recipe_id in st.session_state.favorites:
        st.session_state.favorites.remove(recipe_id)
        save_favorites(st.session_state.favorites)
        return True
    return False

# DASHBOARD PAGE
if menu_option == "📊 Dashboard":
    st.title("📊 Dashboard - NutriChef em Casa")
    st.markdown("Visualize suas estatísticas e dados de uso")
    
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.metric("📝 Receitas Geradas", len(st.session_state.recipes), 
                 delta=None, help="Total de receitas criadas")
    
    with col2:
        st.metric("⭐ Favoritos", len(st.session_state.favorites), 
                 delta=None, help="Receitas marcadas como favoritas")
    
    with col3:
        st.metric("📜 Histórico", len(st.session_state.history), 
                 delta=None, help="Total de consultas registradas")
    
    with col4:
        today_count = len([h for h in st.session_state.history 
                          if h['timestamp'].startswith(datetime.now().strftime("%Y-%m-%d"))])
        st.metric("📅 Hoje", today_count, delta=None, help="Consultas de hoje")
    
    st.markdown("---")
    
    # Charts
    if len(st.session_state.history) > 0:
        col1, col2 = st.columns(2)
        
        with col1:
            st.subheader("Consultas por Data")
            history_df = pd.DataFrame(st.session_state.history)
            history_df['date'] = pd.to_datetime(history_df['timestamp']).dt.date
            date_counts = history_df['date'].value_counts().sort_index()
            
            fig = px.bar(
                x=date_counts.index,
                y=date_counts.values,
                labels={'x': 'Data', 'y': 'Número de Consultas'},
                color_discrete_sequence=['#ff6b6b'],
                title="Atividade de Consultas"
            )
            fig.update_layout(height=400, hovermode='x unified')
            st.plotly_chart(fig, use_container_width=True)
        
        with col2:
            st.subheader("Top Ingredientes Procurados")
            all_ingredients = []
            for entry in st.session_state.history:
                if 'ingredients' in entry:
                    all_ingredients.extend(entry['ingredients'])
            
            if all_ingredients:
                ingredient_counts = pd.Series(all_ingredients).value_counts().head(10)
                fig = px.pie(
                    values=ingredient_counts.values,
                    names=ingredient_counts.index,
                    title="Ingredientes Mais Utilizados",
                    color_discrete_sequence=px.colors.qualitative.Set3
                )
                fig.update_layout(height=400)
                st.plotly_chart(fig, use_container_width=True)
    else:
        st.info("📊 Nenhum dado disponível ainda. Gere suas primeiras receitas para ver as estatísticas!")
    
    st.markdown("---")
    st.subheader("💡 Dicas de Nutrição")
    tips = [
        "🥗 Consuma uma variedade de cores em suas refeições - cada cor representa diferentes nutrientes",
        "💧 Beba pelo menos 2 litros de água por dia",
        "🥘 Prepare refeições com antecedência para manter uma alimentação saudável",
        "🥕 Inclua vegetais em pelo menos 50% do seu prato",
        "⏰ Mastigue devagar e desfrute de suas refeições",
    ]
    for tip in tips:
        st.info(tip)

# RECIPE GENERATION PAGE
elif menu_option == "🥘 Gerar Receita":
    st.title("🥘 Gerar Nova Receita")
    st.markdown("Crie receitas personalizadas com base em seus ingredientes e preferências")
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.subheader("Ingredientes Disponíveis")
        ingredients_input = st.text_area(
            "Liste os ingredientes (um por linha):",
            placeholder="Ex:\nFrango\nTomate\nCebola\nAlho",
            height=200,
            key="ingredients_area"
        )
        
        ingredients_list = [ing.strip() for ing in ingredients_input.split('\n') if ing.strip()]
    
    with col2:
        st.subheader("Preferências")
        cuisine = st.selectbox(
            "Tipo de Culinária",
            ["Brasileira", "Italiana", "Asiática", "Mediterrânea", "Mexicana", "Vegetariana"]
        )
        
        difficulty = st.select_slider(
            "Nível de Dificuldade",
            options=["Muito Fácil", "Fácil", "Médio", "Difícil", "Muito Difícil"],
            value="Médio"
        )
        
        prep_time = st.slider(
            "Tempo de Preparo (minutos)",
            min_value=5,
            max_value=180,
            value=30,
            step=5
        )
        
        servings = st.number_input(
            "Número de Porções",
            min_value=1,
            max_value=12,
            value=4
        )
    
    st.markdown("---")
    
    if st.button("🎯 Gerar Receita", use_container_width=True, type="primary"):
        if ingredients_list:
            # Create recipe template
            recipe = {
                'name': f"Receita com {', '.join(ingredients_list[:2])}",
                'cuisine': cuisine,
                'difficulty': difficulty,
                'prep_time': prep_time,
                'servings': servings,
                'ingredients': ingredients_list,
                'instructions': [
                    f"1. Prepare todos os ingredientes: {', '.join(ingredients_list)}",
                    f"2. Cozinhe em fogo {'baixo' if difficulty in ['Muito Fácil', 'Fácil'] else 'médio/alto'} por aproximadamente {prep_time//2} minutos",
                    f"3. Tempere a gosto e reserve",
                    f"4. Serve para {servings} pessoas",
                ],
                'nutritional_info': {
                    'calories': 250 + (50 * len(ingredients_list)),
                    'protein_g': 15,
                    'carbs_g': 35,
                    'fat_g': 8,
                    'fiber_g': 5
                }
            }
            
            add_recipe(recipe)
            
            st.success("✅ Receita gerada com sucesso!")
            
            # Display the recipe
            st.markdown("---")
            st.subheader(f"🍽️ {recipe['name']}")
            
            col1, col2, col3, col4 = st.columns(4)
            col1.metric("⏱️ Tempo", f"{prep_time} min")
            col2.metric("👥 Porções", servings)
            col3.metric("📊 Dificuldade", difficulty)
            col4.metric("🌍 Culinária", cuisine)
            
            st.markdown("**Ingredientes:**")
            for ing in recipe['ingredients']:
                st.write(f"• {ing}")
            
            st.markdown("**Modo de Preparo:**")
            for instruction in recipe['instructions']:
                st.write(instruction)
            
            st.markdown("**Informação Nutricional (por porção):**")
            nut_col1, nut_col2, nut_col3, nut_col4, nut_col5 = st.columns(5)
            nut_col1.metric("🔥 Calorias", f"{recipe['nutritional_info']['calories']:.0f} kcal")
            nut_col2.metric("🥩 Proteína", f"{recipe['nutritional_info']['protein_g']}g")
            nut_col3.metric("🌾 Carbos", f"{recipe['nutritional_info']['carbs_g']}g")
            nut_col4.metric("🥑 Gordura", f"{recipe['nutritional_info']['fat_g']}g")
            nut_col5.metric("🌿 Fibra", f"{recipe['nutritional_info']['fiber_g']}g")
            
            # Add to favorites button
            col1, col2 = st.columns(2)
            with col1:
                if st.button("⭐ Adicionar aos Favoritos", use_container_width=True):
                    add_to_favorites(recipe['id'], recipe['name'])
            
            with col2:
                if st.button("🗑️ Descartar", use_container_width=True):
                    st.info("Receita descartada")
        else:
            st.error("❌ Por favor, adicione pelo menos um ingrediente")
    
    st.markdown("---")
    st.info("💡 Dica: Quanto mais ingredientes você adicionar, mais criativa será a receita gerada!")

# FAVORITES PAGE
elif menu_option == "⭐ Favoritos":
    st.title("⭐ Receitas Favoritas")
    
    if st.session_state.favorites:
        favorite_recipes = [r for r in st.session_state.recipes if r['id'] in st.session_state.favorites]
        
        if favorite_recipes:
            st.markdown(f"Você tem **{len(favorite_recipes)}** receita(s) favorita(s)")
            st.markdown("---")
            
            for recipe in favorite_recipes:
                with st.container():
                    col1, col2 = st.columns([4, 1])
                    
                    with col1:
                        st.markdown(f"#### 🍽️ {recipe['name']}")
                        
                        col_info1, col_info2, col_info3, col_info4 = st.columns(4)
                        col_info1.caption(f"⏱️ {recipe['prep_time']} min")
                        col_info2.caption(f"👥 {recipe['servings']} porções")
                        col_info3.caption(f"📊 {recipe['difficulty']}")
                        col_info4.caption(f"🌍 {recipe['cuisine']}")
                        
                        st.markdown("**Ingredientes:**")
                        ingredients_str = " • ".join(recipe['ingredients'][:5])
                        if len(recipe['ingredients']) > 5:
                            ingredients_str += f" • +{len(recipe['ingredients']) - 5} mais"
                        st.caption(ingredients_str)
                    
                    with col2:
                        if st.button("❌", key=f"remove_{recipe['id']}", help="Remover dos favoritos"):
                            remove_from_favorites(recipe['id'])
                            st.rerun()
                    
                    with st.expander("Ver Detalhes Completos"):
                        st.markdown("**Modo de Preparo:**")
                        for instruction in recipe['instructions']:
                            st.write(instruction)
                        
                        st.markdown("**Informação Nutricional:**")
                        nut_data = recipe['nutritional_info']
                        col1, col2, col3, col4, col5 = st.columns(5)
                        col1.metric("🔥 Calorias", f"{nut_data['calories']} kcal")
                        col2.metric("🥩 Proteína", f"{nut_data['protein_g']}g")
                        col3.metric("🌾 Carbos", f"{nut_data['carbs_g']}g")
                        col4.metric("🥑 Gordura", f"{nut_data['fat_g']}g")
                        col5.metric("🌿 Fibra", f"{nut_data['fiber_g']}g")
                    
                    st.markdown("---")
        else:
            st.info("Nenhuma receita favorita encontrada")
    else:
        st.info("📌 Você ainda não marcou nenhuma receita como favorita. Gere algumas receitas e adicione-as!")
        
        col1, col2 = st.columns(2)
        with col1:
            if st.button("🥘 Gerar Primeira Receita", use_container_width=True):
                st.switch_page("pages/recipe_generation.py" if "pages" in os.listdir() else None)

# HISTORY PAGE
elif menu_option == "📜 Histórico":
    st.title("📜 Histórico de Consultas")
    st.markdown("Veja todas as receitas que você já gerou")
    
    if st.session_state.history:
        st.markdown(f"Total de **{len(st.session_state.history)}** consulta(s) registrada(s)")
        
        # Filter and sorting options
        col1, col2, col3 = st.columns([2, 2, 2])
        
        with col1:
            search_query = st.text_input("🔍 Pesquisar por receita:")
        
        with col2:
            sort_option = st.selectbox(
                "Ordenar por:",
                ["Mais Recente", "Mais Antigo"]
            )
        
        with col3:
            entries_per_page = st.slider("Entradas por página:", 5, 20, 10)
        
        st.markdown("---")
        
        # Filter history
        filtered_history = st.session_state.history
        if search_query:
            filtered_history = [h for h in filtered_history 
                               if search_query.lower() in h['recipe_name'].lower()]
        
        # Sort history
        if sort_option == "Mais Antigo":
            filtered_history = sorted(filtered_history, key=lambda x: x['timestamp'])
        else:
            filtered_history = sorted(filtered_history, key=lambda x: x['timestamp'], reverse=True)
        
        # Pagination
        total_pages = (len(filtered_history) + entries_per_page - 1) // entries_per_page
        
        if total_pages > 0:
            current_page = st.number_input(
                f"Página (de {total_pages}):",
                min_value=1,
                max_value=total_pages,
                value=1
            )
            
            start_idx = (current_page - 1) * entries_per_page
            end_idx = start_idx + entries_per_page
            page_history = filtered_history[start_idx:end_idx]
            
            for idx, entry in enumerate(page_history, 1):
                with st.container():
                    col1, col2, col3 = st.columns([2, 2, 1])
                    
                    with col1:
                        st.markdown(f"**{entry['recipe_name']}**")
                    
                    with col2:
                        st.caption(f"📅 {entry['timestamp']}")
                    
                    with col3:
                        st.caption(f"#{start_idx + idx}")
                    
                    ingredients_text = ", ".join(entry['ingredients'][:3]) if entry['ingredients'] else "N/A"
                    if len(entry['ingredients']) > 3:
                        ingredients_text += f", +{len(entry['ingredients']) - 3} mais"
                    st.caption(f"🥘 Ingredientes: {ingredients_text}")
                    
                    st.markdown("---")
        else:
            st.info("Nenhum resultado encontrado para sua pesquisa")
    else:
        st.info("📜 Seu histórico está vazio. Gere suas primeiras receitas para começar!")
        
        if st.button("🥘 Gerar Primeira Receita Agora", use_container_width=True):
            st.switch_page("pages/recipe_generation.py" if "pages" in os.listdir() else None)

# ABOUT PAGE
elif menu_option == "ℹ️ Sobre":
    st.title("ℹ️ Sobre NutriChef em Casa")
    
    col1, col2 = st.columns([2, 1])
    
    with col1:
        st.markdown("""
        ## 🍽️ NutriChef em Casa
        
        **Sua aplicação pessoal de receitas e nutrição**
        
        ### O que é?
        NutriChef em Casa é uma aplicação inteligente que ajuda você a:
        - ✨ Gerar receitas personalizadas com os ingredientes que tem em casa
        - 📊 Acompanhar suas receitas com um dashboard interativo
        - ⭐ Salvar suas receitas favoritas para acessar rapidamente
        - 📜 Manter um histórico completo de todas as consultas
        - 🥗 Receber informações nutricionais detalhadas
        
        ### Recursos Principais
        
        **1. Geração de Receitas**
        - Insira os ingredientes disponíveis
        - Escolha a culinária desejada
        - Defina o nível de dificuldade
        - Obtenha receitas personalizadas instantaneamente
        
        **2. Dashboard**
        - Visualize suas estatísticas de uso
        - Acompanhe os ingredientes mais utilizados
        - Veja gráficos de atividade
        - Acesse dicas de nutrição
        
        **3. Favoritos**
        - Marque suas receitas preferidas
        - Acesse facilmente quando desejar
        - Gerencie sua coleção pessoal
        
        **4. Histórico**
        - Veja todas as receitas geradas
        - Pesquise por receita
        - Acesse informações detalhadas
        - Estatísticas de uso
        
        ### Tecnologia
        - Desenvolvido com **Streamlit**
        - Interface moderna e intuitiva
        - Dados salvos localmente
        - Sem necessidade de conexão com internet
        
        ### Como Usar
        1. Acesse o menu na barra lateral
        2. Escolha a opção desejada
        3. Siga as instruções na tela
        4. Disfrute de suas receitas!
        
        ### Dicas de Nutrição
        - 🥗 Inclua frutas e vegetais em todas as refeições
        - 💧 Mantenha-se hidratado
        - 🥘 Prepare refeições com antecedência
        - ⏰ Coma com calma e desfrute
        - 📊 Monitore suas calorias
        """)
    
    with col2:
        st.markdown("""
        ### Informações
        
        **Versão:** 1.0.0
        
        **Última Atualização:**
        2025-12-18
        
        **Desenvolvido por:**
        [NutriChef Team]
        
        ---
        
        ### Estatísticas de Uso
        """)
        
        st.metric("📝 Total de Receitas", len(st.session_state.recipes))
        st.metric("⭐ Favoritas", len(st.session_state.favorites))
        st.metric("📜 Histórico", len(st.session_state.history))
        
        st.markdown("---")
        
        st.markdown("""
        ### Contato & Suporte
        
        Para relatar problemas ou sugerir melhorias,
        entre em contato conosco!
        
        ### Privacidade
        
        Seus dados são armazenados localmente
        em seu dispositivo. Nenhuma informação
        é enviada para servidores externos.
        """)

# Footer
st.markdown("---")
st.markdown("""
<div style='text-align: center; color: #888; font-size: 0.85rem; padding: 20px 0;'>
    <p>🍽️ NutriChef em Casa | Seu assistente pessoal de receitas e nutrição</p>
    <p>Desenvolvido com ❤️ | Versão 1.0.0 | 2025</p>
</div>
""", unsafe_allow_html=True)
