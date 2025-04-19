export class DataManager {
    constructor() {
        this.measurements = [];
        this.currentLanguage = 'es'; // Default language: Spanish
    }
    
    addMeasurement(data) {
        this.measurements.push(data);
    }
    
    removeMeasurement(index) {
        if (index >= 0 && index < this.measurements.length) {
            this.measurements.splice(index, 1);
        }
    }
    
    clearMeasurements() {
        this.measurements = [];
    }
    
    getExportData() {
        const texts = translations[this.currentLanguage].export;
        
        let exportText = `${texts.title}\n`;
        exportText += "=======================================\n";
        exportText += `${texts.author}: Rodrigo Agosta\n`;
        exportText += `${texts.researchGroup}: GIEDI\n`;
        exportText += `${texts.institution}: Facultad Regional Santa Fe - Universidad Tecnológica Nacional\n`;
        exportText += "=======================================\n\n";
        
        exportText += `${texts.recordings}:\n`;
        exportText += `${texts.number}\t${texts.length}(cm)\t${texts.mass}(g)\t${texts.angle}(°)\t${texts.cycles}\t${texts.time}(s)\t${texts.period}(s)\n`;
        
        this.measurements.forEach((data, index) => {
            exportText += `${index+1}\t${data.length}\t\t${data.mass}\t${data.angle}\t\t${data.cycles}\t${data.time}\t\t${data.period}\n`;
        });
        
        exportText += "\n=======================================\n";
        
        // Add basic statistics
        if (this.measurements.length > 0) {
            const periods = this.measurements.map(m => parseFloat(m.period));
            const mean = periods.reduce((sum, val) => sum + val, 0) / periods.length;
            const variance = periods.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / periods.length;
            const stdDev = Math.sqrt(variance);
            
            exportText += `${texts.periodStats}:\n`;
            exportText += `${texts.samplesNumber}: ${periods.length}\n`;
            exportText += `${texts.mean}: ${mean.toFixed(4)} s\n`;
            exportText += `${texts.stdDev}: ${stdDev.toFixed(4)} s\n`;
            exportText += `${texts.variance}: ${variance.toFixed(6)} s²\n`;
            exportText += `${texts.minValue}: ${Math.min(...periods).toFixed(4)} s\n`;
            exportText += `${texts.maxValue}: ${Math.max(...periods).toFixed(4)} s\n`;
        }
        
        return exportText;
    }
    
    setLanguage(language) {
        this.currentLanguage = language;
    }
}

// Add translations
const translations = {
    'es': {
        export: {
            title: 'DATOS DE SIMULACIÓN DE PÉNDULO SIMPLE',
            author: 'Autor',
            researchGroup: 'Grupo de Investigación',
            institution: 'Institución',
            recordings: 'MEDICIONES REGISTRADAS',
            number: 'No.',
            length: 'Largo',
            mass: 'Masa',
            angle: 'Ángulo',
            cycles: 'Ciclos',
            time: 'Tiempo',
            period: 'Período',
            periodStats: 'ESTADÍSTICAS DEL PERÍODO',
            samplesNumber: 'Número de muestras',
            mean: 'Valor promedio',
            stdDev: 'Desviación estándar',
            variance: 'Varianza',
            minValue: 'Valor mínimo',
            maxValue: 'Valor máximo'
        }
    },
    'en': {
        export: {
            title: 'SIMPLE PENDULUM SIMULATION DATA',
            author: 'Author',
            researchGroup: 'Research Group',
            institution: 'Institution',
            recordings: 'RECORDED MEASUREMENTS',
            number: 'No.',
            length: 'Length',
            mass: 'Mass',
            angle: 'Angle',
            cycles: 'Cycles',
            time: 'Time',
            period: 'Period',
            periodStats: 'PERIOD STATISTICS',
            samplesNumber: 'Number of samples',
            mean: 'Average value',
            stdDev: 'Standard deviation',
            variance: 'Variance',
            minValue: 'Minimum value',
            maxValue: 'Maximum value'
        }
    },
    'pt': {
        export: {
            title: 'DADOS DE SIMULAÇÃO DE PÊNDULO SIMPLES',
            author: 'Autor',
            researchGroup: 'Grupo de Pesquisa',
            institution: 'Instituição',
            recordings: 'MEDIÇÕES REGISTRADAS',
            number: 'No.',
            length: 'Comprimento',
            mass: 'Massa',
            angle: 'Ângulo',
            cycles: 'Ciclos',
            time: 'Tempo',
            period: 'Período',
            periodStats: 'ESTATÍSTICAS DO PERÍODO',
            samplesNumber: 'Número de amostras',
            mean: 'Valor médio',
            stdDev: 'Desvio padrão',
            variance: 'Variância',
            minValue: 'Valor mínimo',
            maxValue: 'Valor máximo'
        }
    },
    'de': {
        export: {
            title: 'EINFACHE PENDELSIMULATIONSDATEN',
            author: 'Autor',
            researchGroup: 'Forschungsgruppe',
            institution: 'Institution',
            recordings: 'AUFGEZEICHNETE MESSUNGEN',
            number: 'Nr.',
            length: 'Länge',
            mass: 'Masse',
            angle: 'Winkel',
            cycles: 'Zyklen',
            time: 'Zeit',
            period: 'Periode',
            periodStats: 'PERIODENSTATISTIK',
            samplesNumber: 'Anzahl der Proben',
            mean: 'Durchschnittswert',
            stdDev: 'Standardabweichung',
            variance: 'Varianz',
            minValue: 'Minimalwert',
            maxValue: 'Maximalwert'
        }
    },
    'it': {
        export: {
            title: 'DATI DI SIMULAZIONE DEL PENDOLO SEMPLICE',
            author: 'Autore',
            researchGroup: 'Gruppo di Ricerca',
            institution: 'Istituzione',
            recordings: 'MISURAZIONI REGISTRATE',
            number: 'N.',
            length: 'Lunghezza',
            mass: 'Massa',
            angle: 'Angolo',
            cycles: 'Cicli',
            time: 'Tempo',
            period: 'Periodo',
            periodStats: 'STATISTICHE DEL PERIODO',
            samplesNumber: 'Numero di campioni',
            mean: 'Valore medio',
            stdDev: 'Deviazione standard',
            variance: 'Varianza',
            minValue: 'Valore minimo',
            maxValue: 'Valore massimo'
        }
    },
    'fr': {
        export: {
            title: 'DONNÉES DE SIMULATION DE PENDULE SIMPLE',
            author: 'Auteur',
            researchGroup: 'Groupe de Recherche',
            institution: 'Institution',
            recordings: 'MESURES ENREGISTRÉES',
            number: 'No.',
            length: 'Longueur',
            mass: 'Masse',
            angle: 'Angle',
            cycles: 'Cycles',
            time: 'Temps',
            period: 'Période',
            periodStats: 'STATISTIQUES DE PÉRIODE',
            samplesNumber: 'Nombre d\'échantillons',
            mean: 'Valeur moyenne',
            stdDev: 'Écart type',
            variance: 'Variance',
            minValue: 'Valeur minimale',
            maxValue: 'Valeur maximale'
        }
    }
};