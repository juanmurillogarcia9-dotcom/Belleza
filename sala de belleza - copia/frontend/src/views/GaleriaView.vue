<template>
  <q-page class="esther-page q-pa-xl flex flex-center">
    <div class="salon-background"></div>

    <div class="content-wrapper">
      <div class="text-center q-mb-xl">
        <span class="sub-title-badge">✨ Portafolio ✨</span>
        <h1 class="luxury-heading text-h3 text-weight-bold text-dark q-mt-sm q-mb-xs">Galería de Trabajos</h1>
        <p class="text-subtitle1 text-muted luxury-subtitle">Una muestra visual de la elegancia y transformación de nuestros clientes</p>
      </div>

      <div class="row q-col-gutter-xl justify-center">
        <div class="col-12 col-md-4" v-for="(item, index) in galeria" :key="index">
          <div class="gallery-card">
            <!-- Imagen superior con las fotos ordenadas correctamente -->
            <div class="card-image-container">
              <img :src="item.imagen" :alt="item.titulo" class="gallery-img" />
            </div>

            <!-- Contenido descriptivo -->
            <div class="card-content text-center">
              <div class="text-pink text-weight-bold luxury-heading q-mb-sm" style="font-size: 1.25rem;">{{ item.titulo }}</div>
              <p class="text-muted text-body2" style="line-height: 1.6;">{{ item.descripcion }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue';

const galeria = ref([
  { 
    titulo: 'Estilo Exclusivo 01', 
    descripcion: 'Diseño de corte moderno y asesoramiento de imagen personalizado para realzar la naturalidad del rostro.', 
    imagen: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&q=80&w=800' 
  },
  { 
    titulo: 'Estilo Exclusivo 02', 
    descripcion: 'Técnicas avanzadas de estilismo y cuidado profesional utilizando herramientas de última generación.', 
    imagen: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=800' 
  },
  { 
    titulo: 'Estilo Exclusivo 03', 
    descripcion: 'Aplicación de tendencias vanguardistas enfocadas en la elegancia y sofisticación de cada detalle.', 
    imagen: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&q=80&w=800' 
  },
  { 
    titulo: 'Estilo Exclusivo 04', 
    descripcion: 'Transformación completa de look con un acabado brillante, sedoso y de alta duración en el salón.', 
    imagen: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=800' 
  },
  { 
    titulo: 'Estilo Exclusivo 05', 
    descripcion: 'Tratamientos capilares especializados para la nutrición profunda y revitalización de la hebra capilar.', 
    imagen: 'https://tse1.explicit.bing.net/th/id/OIP.x6kcuvQzQ3sigSzuYPCmHQHaE8?r=0&rs=1&pid=ImgDetMain&o=7&rm=3' 
  },
  { 
    titulo: 'Estilo Exclusivo 06', 
    descripcion: 'Iluminación y coloración profesional cuidando al máximo la salud y textura natural de tu cabello.', 
    imagen: 'https://tse1.mm.bing.net/th/id/OIP.J_XG_TxD52FLJko4FeP4rAHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3' 
  }
]);
</script>

<style scoped>
.esther-page { 
  position: relative; 
  min-height: 100vh; 
  overflow-x: hidden; 
}

.salon-background {
  position: absolute; 
  top: 0; 
  left: 0; 
  width: 100%; 
  height: 100%;
  background-image: linear-gradient(rgba(252, 251, 249, 0.82), rgba(252, 251, 249, 0.88)), 
                    url('https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=1920');
  background-size: cover; 
  background-position: center; 
  z-index: 1;
}

.content-wrapper { 
  position: relative; 
  z-index: 2; 
  width: 100%; 
  max-width: 1200px; 
  padding: 20px 0; 
}

.sub-title-badge {
  display: inline-block; 
  font-size: 0.85rem; 
  letter-spacing: 2px; 
  color: #b3637e; 
  text-transform: uppercase; 
  font-weight: 600;
  background: rgba(216, 131, 158, 0.1); 
  padding: 4px 14px; 
  border-radius: 20px; 
  border: 1px solid rgba(216, 131, 158, 0.2);
}

.luxury-heading { 
  font-family: 'Playfair Display', serif; 
  letter-spacing: -0.5px; 
  color: #232023; 
}

.luxury-subtitle { 
  font-family: 'Playfair Display', serif; 
  font-style: italic; 
  color: #5c5559; 
}

.text-pink { 
  color: #b3637e !important; 
}

.text-muted { 
  color: #5c5559 !important; 
}

.gallery-card {
  background-color: rgba(255, 255, 255, 0.96); 
  backdrop-filter: blur(12px);
  border: 1px solid rgba(216, 131, 158, 0.25); 
  border-radius: 20px; 
  overflow: hidden;
  height: 100%;
  box-shadow: 0 15px 40px rgba(179, 99, 126, 0.08); 
  transition: all 0.3s ease;
}

.gallery-card:hover { 
  border-color: #d8839e; 
  transform: translateY(-4px); 
  box-shadow: 0 20px 45px rgba(179, 99, 126, 0.15); 
}

.card-image-container {
  width: 100%;
  height: 240px;
  overflow: hidden;
  background-color: #f7f0f3;
}

.gallery-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.gallery-card:hover .gallery-img {
  transform: scale(1.05);
}

.card-content {
  padding: 24px;
}
</style>