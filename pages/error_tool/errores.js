function exportarJSON() {
  // parámetros a exportar con getid
    const data = {
      material: document.getElementById('material').value,
      espesor: parseFloat(document.getElementById('espesor').value),
      medioExterior: document.getElementById('medioExterior').value,
      anguloIncidencia: parseFloat(document.getElementById('anguloIncidencia').value),
      errorPorcentual: parseFloat(document.getElementById('errorPorcentual').value)
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = "escenario.json";
    a.click();

    URL.revokeObjectURL(url);
  }

  function importarJSON(event) {
    // si no se carga ningún archivo
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const data = JSON.parse(e.target.result);

        document.getElementById('material').value = data.material || '';
        document.getElementById('espesor').value = data.espesor || 0;
        document.getElementById('medioExterior').value = data.medioExterior || '';
        document.getElementById('anguloIncidencia').value = data.anguloIncidencia || 0;
        document.getElementById('errorPorcentual').value = data.errorPorcentual || 0;

      } catch (err) {
        alert("Error al leer el archivo JSON");
      }
    };

    reader.readAsText(file);
  }