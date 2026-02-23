import React, { useState } from 'react';
import Svg, { Line, Circle, Text as SvgText, Path } from 'react-native-svg';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet
} from 'react-native';

export default function App() {
  const [VBB, setVBB] = useState("5");
  const [VCC, setVCC] = useState("12");
  const [RB, setRB] = useState("10000");
  const [RC, setRC] = useState("100");
  const [beta, setBeta] = useState("100");
  const [result, setResult] = useState(null);

  const calculate = () => {
    const vbb = parseFloat(VBB);
    const vcc = parseFloat(VCC);
    const rb = parseFloat(RB);
    const rc = parseFloat(RC);
    const b = parseFloat(beta);
    const VBE = 0.7;

    if (!vbb || !vcc || !rb || !rc || !b) return;

    let IB = (vbb - VBE) / rb;
    let IC = b * IB;
    let ICmax = vcc / rc;

    let saturated = false;

    if (IC > ICmax) {
      IC = ICmax;
      saturated = true;
    }

    let VC = vcc - IC * rc;
    let VCE = VC;
    let PT = VCE * IC;
    let PRC = IC * IC * rc;
    let PRB = IB * IB * rb;

    setResult({
      IB,
      IC,
      ICmax,
      VC,
      VCE,
      PT,
      PRC,
      PRB,
      saturated
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Calculadora de Transistor</Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Entradas</Text>

        <Input label="VBB (V)" value={VBB} setValue={setVBB} />
        <Input label="VCC (V)" value={VCC} setValue={setVCC} />
        <Input label="RB (Ω)" value={RB} setValue={setRB} />
        <Input label="RC (Ω)" value={RC} setValue={setRC} />
        <Input label="Beta (β)" value={beta} setValue={setBeta} />

        <TouchableOpacity style={styles.button} onPress={calculate}>
          <Text style={styles.buttonText}>Calcular</Text>
        </TouchableOpacity>
      </View>

      {result && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Resultados</Text>

          <Result label="IB" value={`${result.IB.toExponential(3)} A`} />
          <Result label="IC" value={`${result.IC.toExponential(3)} A`} />
          <Result label="IC Máx" value={`${result.ICmax.toExponential(3)} A`} />
          <Result label="VC" value={`${result.VC.toFixed(2)} V`} />
          <Result label="VCE" value={`${result.VCE.toFixed(2)} V`} />
          <Result label="Potência Transistor" value={`${result.PT.toFixed(3)} W`} />
          <Result label="Potência RC" value={`${result.PRC.toFixed(3)} W`} />
          <Result label="Potência RB" value={`${result.PRB.toFixed(6)} W`} />
          <Result
            label="Estado"
            value={result.saturated ? "Saturado" : "Região Ativa"}
          />
        </View>
      )}
      <CircuitDiagram />
    </ScrollView>
  );
}

function Input({ label, value, setValue }) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={setValue}
        keyboardType="numeric"
      />
    </View>
  );
}

function Result({ label, value }) {
  return (
    <View style={styles.resultRow}>
      <Text style={styles.resultLabel}>{label}</Text>
      <Text style={styles.resultValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f4f6f9",
    flexGrow: 1
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#1e293b"
  },
  card: {
    backgroundColor: "#ffffff",
    padding: 18,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    color: "#334155"
  },
  label: {
    marginBottom: 4,
    color: "#475569"
  },
  input: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#f8fafc"
  },
  button: {
    backgroundColor: "#2563eb",
    padding: 14,
    borderRadius: 10,
    marginTop: 10,
    alignItems: "center"
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16
  },
  resultRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8
  },
  resultLabel: {
    color: "#475569"
  },
  resultValue: {
    fontWeight: "600",
    color: "#0f172a"
  }
});

function CircuitDiagram() {
  return (
    <View style={{ alignItems: "center", marginTop: 30 }}>
      <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 10 }}>
        Circuito Emissor Comum
      </Text>

      <Svg width="420" height="420">

        {/* ================= GND (MAIS ABAIXO) ================= */}
        <Line x1="250" y1="360" x2="290" y2="360" stroke="black" strokeWidth="2" />
        <Line x1="255" y1="370" x2="285" y2="370" stroke="black" strokeWidth="2" />
        <Line x1="260" y1="380" x2="280" y2="380" stroke="black" strokeWidth="2" />

        {/* ================= VCC ================= */}

        {/* Fio superior até RC */}
        <Line x1="350" y1="80" x2="300" y2="80" stroke="black" strokeWidth="2" />

        {/* RC horizontal */}
        <Path
          d="M300 80
             L290 70
             L280 90
             L270 70
             L260 90
             L250 70
             L240 90
             L230 80"
          stroke="black"
          fill="none"
          strokeWidth="2"
        />

        {/* Fio vertical até coletor */}
        <Line x1="230" y1="80" x2="230" y2="140" stroke="black" strokeWidth="2" />

        {/* Fonte VCC */}
        <Circle cx="350" cy="170" r="20" stroke="black" fill="none" strokeWidth="2" />
        <SvgText x="343" y="165" fontSize="14">+</SvgText>
        <SvgText x="343" y="180" fontSize="14">−</SvgText>
        <SvgText x="335" y="205" fontSize="14">VCC</SvgText>

        {/* Fio do topo da fonte até nó RC */}
        <Line x1="350" y1="150" x2="350" y2="80" stroke="black" strokeWidth="2" />

        {/* Fio do fundo da fonte até GND */}
        <Line x1="350" y1="190" x2="350" y2="340" stroke="black" strokeWidth="2" />
        <Line x1="350" y1="340" x2="270" y2="340" stroke="black" strokeWidth="2" />
        <Line x1="270" y1="340" x2="270" y2="360" stroke="black" strokeWidth="2" />

        {/* ================= TRANSISTOR ================= */}

        {/* Base vertical */}
        <Line x1="210" y1="150" x2="210" y2="270" stroke="black" strokeWidth="2" />

        {/* Coletor inclinado */}
        <Line x1="210" y1="170" x2="230" y2="140" stroke="black" strokeWidth="2" />

        {/* Emissor */}
        <Line x1="210" y1="250" x2="240" y2="280" stroke="black" strokeWidth="2" />

        {/* Seta NPN */}
        <Path d="M235 275 L240 280 L232 282 Z" fill="black" />

        {/* Emissor até GND */}
        <Line x1="240" y1="280" x2="240" y2="340" stroke="black" strokeWidth="2" />

        {/* ================= RB ================= */}

        {/* RB horizontal */}
        <Path
          d="M100 220
             L110 210
             L120 230
             L130 210
             L140 230
             L150 210
             L160 220"
          stroke="black"
          fill="none"
          strokeWidth="2"
        />

        {/* Fio até base */}
        <Line x1="160" y1="220" x2="210" y2="220" stroke="black" strokeWidth="2" />

        {/* ================= VBB ================= */}

        {/* Fonte VBB */}
        <Circle cx="70" cy="270" r="20" stroke="black" fill="none" strokeWidth="2" />
        <SvgText x="63" y="265" fontSize="14">+</SvgText>
        <SvgText x="63" y="280" fontSize="14">−</SvgText>
        <SvgText x="55" y="305" fontSize="14">VBB</SvgText>

        {/* Ligação positiva (sem diagonal) */}
        <Line x1="70" y1="250" x2="70" y2="220" stroke="black" strokeWidth="2" />
        <Line x1="70" y1="220" x2="100" y2="220" stroke="black" strokeWidth="2" />

        {/* Negativo até GND */}
        <Line x1="70" y1="290" x2="70" y2="340" stroke="black" strokeWidth="2" />
        <Line x1="70" y1="340" x2="270" y2="340" stroke="black" strokeWidth="2" />

      </Svg>
    </View>
  );
}