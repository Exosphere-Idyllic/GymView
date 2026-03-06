const cedula = "0150212983";
// Verifica longitud y que solo contenga números
if (!cedula.match(/^\d{10}$/)) { console.log("Falla longitud/digitos"); process.exit(1); }
const provincia = parseInt(cedula.substring(0, 2), 10);
if (provincia < 1 || provincia > 24) { console.log("Falla provincia: " + provincia); process.exit(1); }
const tercerDigito = parseInt(cedula.substring(2, 3), 10);
if (tercerDigito >= 6) { console.log("Falla 3er digito: " + tercerDigito); process.exit(1); }
const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
let suma = 0;
for (let i = 0; i < 9; i++) {
    let valor = parseInt(cedula.charAt(i), 10) * coeficientes[i];
    if (valor >= 10) valor -= 9;
    suma += valor;
}
const digitoVerificador = parseInt(cedula.charAt(9), 10);
const decenaSuperior = Math.ceil(suma / 10) * 10;
let resultado = decenaSuperior - suma;
if (resultado === 10) resultado = 0;
console.log("Suma: " + suma + " Decena: " + decenaSuperior + " Result: " + resultado + " Verif: " + digitoVerificador);
console.log("Valida: " + (resultado === digitoVerificador));
