// Script para actualizar registros de audiometría existentes con valores PAB calculados
const mongoose = require('mongoose');

// Esquema de audiometría (simplificado)
const audiometriaSchema = new mongoose.Schema({
  fechaAudiometria: Date,
  metodoAudiometria: String,
  oidoDerecho500: Number,
  oidoDerecho1000: Number,
  oidoDerecho2000: Number,
  oidoDerecho3000: Number,
  oidoDerecho4000: Number,
  oidoDerecho6000: Number,
  oidoIzquierdo500: Number,
  oidoIzquierdo1000: Number,
  oidoIzquierdo2000: Number,
  oidoIzquierdo3000: Number,
  oidoIzquierdo4000: Number,
  oidoIzquierdo6000: Number,
  porcentajePerdidaOD: Number,
  porcentajePerdidaOI: Number,
  hipoacusiaBilateralCombinada: Number,
  perdidaAuditivaBilateralAMA: Number,
  perdidaMonauralOD_AMA: Number,
  perdidaMonauralOI_AMA: Number,
  idTrabajador: { type: mongoose.Schema.Types.ObjectId, ref: 'Trabajador' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

const Audiometria = mongoose.model('Audiometria', audiometriaSchema);

// Función para calcular PTA AMA (500, 1000, 2000, 3000 Hz)
function calcularPTA_AMA(oidoDerecho500, oidoDerecho1000, oidoDerecho2000, oidoDerecho3000, oidoIzquierdo500, oidoIzquierdo1000, oidoIzquierdo2000, oidoIzquierdo3000, oido) {
  const frecuencias = [500, 1000, 2000, 3000];
  let valores;
  
  if (oido === 'derecho') {
    valores = [
      oidoDerecho500 || 0,
      oidoDerecho1000 || 0,
      oidoDerecho2000 || 0,
      oidoDerecho3000 || 0
    ];
  } else {
    valores = [
      oidoIzquierdo500 || 0,
      oidoIzquierdo1000 || 0,
      oidoIzquierdo2000 || 0,
      oidoIzquierdo3000 || 0
    ];
  }
  
  const suma = valores.reduce((acc, val) => acc + val, 0);
  return suma / frecuencias.length;
}

// Función para calcular porcentaje AMA por oído
function calcularPorcentajeAMA(pta) {
  return Math.max(0, (pta - 25)) * 1.5;
}

// Función para calcular pérdida auditiva bilateral AMA
function calcularPerdidaAuditivaBilateralAMA(perdidaOD, perdidaOI) {
  const menor = Math.min(perdidaOD, perdidaOI);
  const mayor = Math.max(perdidaOD, perdidaOI);
  return ((5 * menor) + mayor) / 6;
}

async function updateAudiometriaPAB() {
  try {
    // Conectar a MongoDB
    await mongoose.connect('mongodb://localhost:27017/ramazzini-v2', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Conectado a MongoDB');
    
    // Buscar registros de audiometría que no tengan perdidaAuditivaBilateralAMA
    const audiometrias = await Audiometria.find({
      $or: [
        { perdidaAuditivaBilateralAMA: { $exists: false } },
        { perdidaAuditivaBilateralAMA: null },
        { perdidaMonauralOD_AMA: { $exists: false } },
        { perdidaMonauralOD_AMA: null },
        { perdidaMonauralOI_AMA: { $exists: false } },
        { perdidaMonauralOI_AMA: null }
      ]
    });
    
    console.log(`Encontrados ${audiometrias.length} registros de audiometría sin campos PAB`);
    
    let updatedCount = 0;
    
    for (const audiometria of audiometrias) {
      try {
        // Calcular PTA AMA para ambos oídos
        const ptaOD = calcularPTA_AMA(
          audiometria.oidoDerecho500,
          audiometria.oidoDerecho1000,
          audiometria.oidoDerecho2000,
          audiometria.oidoDerecho3000,
          null, null, null, null,
          'derecho'
        );
        
        const ptaOI = calcularPTA_AMA(
          null, null, null, null,
          audiometria.oidoIzquierdo500,
          audiometria.oidoIzquierdo1000,
          audiometria.oidoIzquierdo2000,
          audiometria.oidoIzquierdo3000,
          'izquierdo'
        );
        
        // Calcular porcentajes AMA por oído
        const perdidaOD_AMA = Math.round(calcularPorcentajeAMA(ptaOD) * 100) / 100;
        const perdidaOI_AMA = Math.round(calcularPorcentajeAMA(ptaOI) * 100) / 100;
        
        // Calcular pérdida auditiva bilateral AMA
        const perdidaBilateralAMA = Math.round(calcularPerdidaAuditivaBilateralAMA(perdidaOD_AMA, perdidaOI_AMA) * 100) / 100;
        
        // Actualizar el registro
        await Audiometria.findByIdAndUpdate(audiometria._id, {
          $set: {
            perdidaMonauralOD_AMA: perdidaOD_AMA,
            perdidaMonauralOI_AMA: perdidaOI_AMA,
            perdidaAuditivaBilateralAMA: perdidaBilateralAMA,
            metodoAudiometria: audiometria.metodoAudiometria || 'AMA' // Establecer AMA como default si no existe
          }
        });
        
        console.log(`Actualizado registro ${audiometria._id}: PAB=${perdidaBilateralAMA}%, OD=${perdidaOD_AMA}%, OI=${perdidaOI_AMA}%`);
        updatedCount++;
        
      } catch (error) {
        console.error(`Error actualizando registro ${audiometria._id}:`, error.message);
      }
    }
    
    console.log(`Proceso completado. ${updatedCount} registros actualizados.`);
    
  } catch (error) {
    console.error('Error en el proceso:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Desconectado de MongoDB');
  }
}

// Ejecutar el script
updateAudiometriaPAB();
