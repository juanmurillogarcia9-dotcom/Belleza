<template>
  <q-page class="esther-page q-pa-xl flex flex-center">
    <div class="salon-background"></div>

    <div class="form-container">
      <div class="esther-card text-center">
        <span class="sub-title-badge q-mb-md">✨ Nuestra Esencia ✨</span>
        <h1 class="luxury-heading text-h3 text-weight-bold text-pink q-mb-md">Sobre Nosotros</h1>
        <p class="text-muted q-mb-lg luxury-body" style="line-height: 1.8;">
          En <strong class="text-dark">Salón de Belleza Esther</strong> combinamos la pasión por el estilismo con la más alta calidad en atención personalizada. Nuestro compromiso es brindarte un espacio exclusivo de desconexión, lujo y cuidado profesional pensado exclusivamente para ti.
        </p>
        <div class="badge-footer">✨ Tradición y Vanguardia en Belleza ✨</div>
      </div>
    </div>
  </q-page>
</template>

<style scoped>
.esther-page { position: relative; min-height: 100vh; overflow-y: auto; padding: 40px 20px; }

/* Fondo mejorado del salón: imagen de alta calidad, nítida y con un degradado suave */
.salon-background {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background-image: linear-gradient(rgba(255, 255, 255, 0.45), rgba(255, 255, 255, 0.65)), 
                    url('https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=95&w=2000');
  background-size: cover; background-position: center; z-index: 1;
}

.form-container { position: relative; z-index: 2; width: 100%; max-width: 850px; padding: 20px; }

.sub-title-badge {
  display: inline-block; font-size: 0.85rem; letter-spacing: 2px; color: #b3637e; text-transform: uppercase; font-weight: 600;
  background: rgba(216, 131, 158, 0.12); padding: 6px 16px; border-radius: 20px; border: 1px solid rgba(216, 131, 158, 0.25);
}

.luxury-heading { font-family: 'Playfair Display', serif; letter-spacing: -0.5px; }
.luxury-body { font-size: 1.15rem; color: #4a4245; font-family: 'Plus Jakarta Sans', sans-serif; }
.text-pink { color: #b3637e !important; }
.text-dark { color: #232023 !important; }
.text-muted { color: #5c5559 !important; }

.esther-card {
  background-color: rgba(255, 255, 255, 0.95); backdrop-filter: blur(16px);
  border: 1px solid rgba(216, 131, 158, 0.3); border-radius: 24px; padding: 50px 40px; 
  box-shadow: 0 20px 50px rgba(179, 99, 126, 0.12);
}

.badge-footer {
  display: inline-block; font-family: 'Playfair Display', serif; font-style: italic;
  color: #b3637e; font-weight: 700; font-size: 1.1rem; background: rgba(216, 131, 158, 0.1);
  padding: 8px 24px; border-radius: 30px; border: 1px solid rgba(216, 131, 158, 0.25);
}
</style>