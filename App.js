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
        <View
          style={[
            styles.card,
            {
              borderLeftWidth: 6,
              borderLeftColor: result.saturated ? "#dc2626" : "#16a34a"
            }
          ]}
        >
          <Text style={styles.sectionTitle}>Resultados</Text>

          <View style={styles.resultGrid}>
            <Result label="IB" value={`${result.IB.toExponential(3)} A`} />
            <Result label="IC" value={`${result.IC.toExponential(3)} A`} />
            <Result label="IC Máx" value={`${result.ICmax.toExponential(3)} A`} />
            <Result label="VC" value={`${result.VC.toFixed(2)} V`} />
            <Result label="VCE" value={`${result.VCE.toFixed(2)} V`} />
            <Result label="P Trans." value={`${result.PT.toFixed(3)} W`} />
            <Result label="P RC" value={`${result.PRC.toFixed(3)} W`} />
            <Result label="P RB" value={`${result.PRB.toFixed(6)} W`} />
          </View>

          <View style={{ marginTop: 10 }}>
            <Text
              style={{
                fontWeight: "700",
                fontSize: 15,
                color: result.saturated ? "#dc2626" : "#16a34a"
              }}
            >
              Estado: {result.saturated ? "Saturado" : "Região Ativa"}
            </Text>
          </View>
        </View>
      )}
      <View style={styles.card}>
        <CircuitDiagram />
      </View>
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
    <View style={styles.resultBox}>
      <Text style={styles.resultLabel}>{label}</Text>
      <Text style={styles.resultValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#eef2f7",
    flexGrow: 1
  },

  title: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 24,
    textAlign: "center",
    color: "#0f172a",
    letterSpacing: 0.5
  },

  card: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 18,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
    color: "#1e293b"
  },

  label: {
    marginBottom: 6,
    fontSize: 13,
    fontWeight: "600",
    color: "#64748b"
  },

  input: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    padding: 12,
    backgroundColor: "#f8fafc",
    fontSize: 15
  },

  button: {
    marginTop: 16,
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    backgroundColor: "#2563eb",
    shadowColor: "#2563eb",
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6
  },

  buttonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 0.5
  },

  resultGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between"
  },

  resultBox: {
    width: "48%",
    backgroundColor: "#f1f5f9",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12
  },

  resultLabel: {
    fontSize: 12,
    color: "#64748b"
  },

  resultValue: {
    fontSize: 15,
    fontWeight: "700",
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