import React, { useState, useRef, useEffect } from 'react';
import Svg, { Line, Circle, Text as SvgText, Path } from 'react-native-svg';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated
} from 'react-native';

export default function App() {
  const [VBB, setVBB] = useState("5");
  const [VCC, setVCC] = useState("12");
  const [RB, setRB] = useState("10000");
  const [RC, setRC] = useState("100");
  const [beta, setBeta] = useState("100");
  const [RE, setRE] = useState("1000");
  const [R1, setR1] = useState("10000");
  const [R2, setR2] = useState("10000");
  const [mode, setMode] = useState("RB");
  const [result, setResult] = useState(null);

  const calculate = () => {
    const vbb = parseFloat(VBB);
    const vcc = parseFloat(VCC);
    const rb = parseFloat(RB);
    const rc = parseFloat(RC);
    const re = parseFloat(RE);
    const b = parseFloat(beta);

    const VBE = 0.7;
    const VCEsat = 0.2;

    if (
      isNaN(vcc) ||
      isNaN(rc) ||
      isNaN(b) ||
      (mode === "DIV" && isNaN(vbb)) ||
      (mode === "RB" && isNaN(rb)) ||
      (mode === "RE" && isNaN(re))
    ) {
      return;
    }

    let IB = 0;
    let IC = 0;
    let ICmax = 0;
    let VC = 0;
    let VCE = 0;
    let region = "";

    // ========================= MODO RB =========================
    if (mode === "RB") {

      if (vbb <= VBE) {
        IB = 0;
        IC = 0;
        ICmax = (vcc - VCEsat) / rc;
        VC = vcc;
        VCE = vcc;
        region = "Corte";
      } else {
        IB = (vbb - VBE) / rb;
        const IC_teorico = b * IB;
        ICmax = (vcc - VCEsat) / rc;

        if (IC_teorico >= ICmax) {
          IC = ICmax;
          VCE = VCEsat;
          VC = VCEsat;
          region = "Saturação";
        } else {
          IC = IC_teorico;
          VC = vcc - IC * rc;
          VCE = VC;
          region = "Região Ativa";
        }
      }
    }

    // ========================= MODO RE =========================
    if (mode === "RE") {

      if (vbb <= VBE) {
        IB = 0;
        IC = 0;
        ICmax = (vcc - VCEsat) / rc;
        VC = vcc;
        VCE = vcc;
        region = "Corte";
      } else {

        // Novo cálculo da base considerando RE
        IB = (vbb - VBE) / ((b + 1) * re);
        const IC_teorico = b * IB;

        ICmax = (vcc - VCEsat) / rc;

        if (IC_teorico >= ICmax) {
          IC = ICmax;
          VCE = VCEsat;
          VC = VCEsat;
          region = "Saturação";
        } else {
          IC = IC_teorico;
          VC = vcc - IC * rc;
          VCE = VC - ((b + 1) * IB * re); // considera queda em RE
          region = "Região Ativa";
        }
      }
    }
    // ========================= MODO DIVISOR =========================
    if (mode === "DIV") {

      const r1 = parseFloat(R1);
      const r2 = parseFloat(R2);
      const re = parseFloat(RE);

      if (isNaN(r1) || isNaN(r2) || isNaN(re)) return;

      // Tensão na base pelo divisor
      const Vth = vcc * (r2 / (r1 + r2));
      const Rth = (r1 * r2) / (r1 + r2);

      if (Vth <= VBE) {
        IB = 0;
        IC = 0;
        ICmax = (vcc - VCEsat) / rc;
        VC = vcc;
        VCE = vcc;
        region = "Corte";
      } else {

        IB = (Vth - VBE) / (Rth + (b + 1) * re);
        const IC_teorico = b * IB;
        ICmax = (vcc - VCEsat) / rc;

        if (IC_teorico >= ICmax) {
          IC = ICmax;
          VCE = VCEsat;
          VC = VCEsat;
          region = "Saturação";
        } else {
          IC = IC_teorico;
          VC = vcc - IC * rc;
          VCE = VC - ((b + 1) * IB * re);
          region = "Região Ativa";
        }
      }
    }

    const PT = VCE * IC;
    const PRC = IC * IC * rc;
    const PRB = mode === "RB" ? IB * IB * rb : 0;

    setResult({
      IB,
      IC,
      ICmax,
      VC,
      VCE,
      PT,
      PRC,
      PRB,
      region
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Calculadora de Transistor</Text>

      <View style={{ flexDirection: "row", marginBottom: 20 }}>
        <TouchableOpacity
          style={[
            styles.modeButton,
            mode === "RB" && styles.modeButtonActive
          ]}
          onPress={() => setMode("RB")}
        >
          <Text style={styles.modeText}>Com RB</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.modeButton,
            mode === "RE" && styles.modeButtonActive
          ]}
          onPress={() => setMode("RE")}
        >
          <Text style={styles.modeText}>Com RE</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.modeButton,
            mode === "DIV" && styles.modeButtonActive
          ]}
          onPress={() => setMode("DIV")}
        >
          <Text style={styles.modeText}>Divisor</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <CircuitDiagram mode={mode} />
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Entradas</Text>


        {mode !== "DIV" && (
          <Input label="VBB (V)" value={VBB} setValue={setVBB} />
        )}
        <Input label="VCC (V)" value={VCC} setValue={setVCC} />
        {mode === "RB" && (
          <Input label="RB (Ω)" value={RB} setValue={setRB} />
        )}

        {mode === "RE" && (
          <Input label="RE (Ω)" value={RE} setValue={setRE} />
        )}
        {mode === "DIV" && (
          <>
            <Input label="R1 (Ω)" value={R1} setValue={setR1} />
            <Input label="R2 (Ω)" value={R2} setValue={setR2} />
            <Input label="RE (Ω)" value={RE} setValue={setRE} />
          </>
        )}
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
              borderLeftColor:
                result.region === "Saturação"
                  ? "#dc2626"
                  : result.region === "Corte"
                    ? "#f59e0b"
                    : "#16a34a"
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
                color:
                  result.region === "Saturação"
                    ? "#dc2626"
                    : result.region === "Corte"
                      ? "#f59e0b"
                      : "#16a34a"
              }}
            >
              Estado: {result.region}
            </Text>
          </View>
        </View>
      )}
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
  modeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#e2e8f0",
    alignItems: "center",
    marginRight: 10
  },

  modeButtonActive: {
    backgroundColor: "#2563eb"
  },

  modeText: {
    fontWeight: "600",
    color: "white"
  },

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

function CircuitDiagram({ mode }) {
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true
      })
    ]).start();
  }, [mode]);

  return (
    <Animated.View
      style={{ alignItems: "center", marginTop: 30, opacity: fadeAnim }}
    >
      <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 10 }}>
        {mode === "RB"
          ? "Emissor Comum com Polarização por RB"
          : mode === "RE"
            ? "Emissor Comum com RE"
            : "Emissor Comum com Divisor de Tensão"}
      </Text>

      <Svg width="420" height="420">

        {/* ================= GND (MAIS ABAIXO) ================= */}
        <Line x1="250" y1="360" x2="290" y2="360" stroke="black" strokeWidth="2" />
        <Line x1="255" y1="370" x2="285" y2="370" stroke="black" strokeWidth="2" />
        <Line x1="260" y1="380" x2="280" y2="380" stroke="black" strokeWidth="2" />

        {/* ================= RC ================= */}

        {mode !== "DIV" && (
          <>
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

            <SvgText x="255" y="65" fontSize="14" fontWeight="bold">
              RC
            </SvgText>

            {/* Fio vertical até coletor */}
            <Line x1="230" y1="80" x2="230" y2="175" stroke="black" strokeWidth="2" />
          </>
        )}

        {mode === "DIV" && (
          <>
            {/* Barramento VCC horizontal */}
            <Line x1="350" y1="80" x2="230" y2="80" stroke="black" strokeWidth="2" />

            {/* RC vertical */}
            <Path
              d="M230 80
         L220 90
         L240 100
         L220 110
         L240 120
         L220 130
         L240 140
         L230 150"
              stroke="black"
              fill="none"
              strokeWidth="2"
            />

            <SvgText x="245" y="115" fontSize="14" fontWeight="bold">
              RC
            </SvgText>

            {/* Fio até coletor */}
            <Line x1="230" y1="150" x2="230" y2="175" stroke="black" strokeWidth="2" />
          </>
        )}

        {/* ================= VCC ================= */}

        <Circle cx="350" cy="170" r="20" stroke="black" fill="none" strokeWidth="2" />
        <SvgText x="343" y="165" fontSize="14">+</SvgText>
        <SvgText x="343" y="180" fontSize="14">−</SvgText>
        <SvgText x="360" y="147" fontSize="14" fontWeight="bold">VCC</SvgText>

        {/* Fio do topo da fonte até nó RC */}
        <Line x1="350" y1="150" x2="350" y2="80" stroke="black" strokeWidth="2" />

        {/* Fio do fundo da fonte até GND */}
        <Line x1="350" y1="190" x2="350" y2="340" stroke="black" strokeWidth="2" />
        <Line x1="350" y1="340" x2="270" y2="340" stroke="black" strokeWidth="2" />
        <Line x1="270" y1="340" x2="270" y2="360" stroke="black" strokeWidth="2" />

        {/* ================= TRANSISTOR ================= */}

        {/* Base vertical */}
        <Line x1="210" y1="185" x2="210" y2="255" stroke="black" strokeWidth="2" />

        {/* Coletor inclinado */}
        <Line x1="210" y1="205" x2="230" y2="175" stroke="black" strokeWidth="2" />

        {/* Emissor */}
        <Line x1="210" y1="235" x2="240" y2="265" stroke="black" strokeWidth="2" />

        {/* Seta NPN */}
        <Path d="M240 257 L240 265 L232 267 Z" fill="black" />

        {/* ================= EMISSOR E RESISTOR ================= */}

        {mode === "RB" && (
          <>
            {/* Emissor direto para GND */}
            <Line x1="240" y1="265" x2="240" y2="340" stroke="black" strokeWidth="2" />

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

            {/* RB texto */}
            <SvgText x="120" y="200" fontSize="14" fontWeight="bold">
              RB
            </SvgText>

            {/* Fio até base */}
            <Line x1="160" y1="220" x2="210" y2="220" stroke="black" strokeWidth="2" />
          </>
        )}

        {mode === "RE" && (
          <>
            {/* RE vertical no emissor */}
            <Path
              d="M240 265
         L230 275
         L250 285
         L230 295
         L250 305
         L230 315
         L240 325"
              stroke="black"
              fill="none"
              strokeWidth="2"
            />

            {/* RE texto */}
            <SvgText x="255" y="320" fontSize="14" fontWeight="bold">
              RE
            </SvgText>

            {/* Fio até GND */}
            <Line x1="240" y1="325" x2="240" y2="340" stroke="black" strokeWidth="2" />

            {/* Base ligada direto à fonte */}
            <Line x1="100" y1="220" x2="210" y2="220" stroke="black" strokeWidth="2" />
          </>
        )}

        {/* ================= VBB ================= */}
        {mode !== "DIV" && (
          <>
            {/* Fonte VBB */}
            <Circle cx="70" cy="270" r="20" stroke="black" fill="none" strokeWidth="2" />
            <SvgText x="63" y="265" fontSize="14">+</SvgText>
            <SvgText x="63" y="280" fontSize="14">−</SvgText>
            <SvgText x="30" y="247" fontSize="14" fontWeight="bold">VBB</SvgText>

            {/* Ligação positiva (sem diagonal) */}
            <Line x1="70" y1="250" x2="70" y2="220" stroke="black" strokeWidth="2" />
            <Line x1="70" y1="220" x2="100" y2="220" stroke="black" strokeWidth="2" />

            {/* Negativo até GND */}
            <Line x1="70" y1="290" x2="70" y2="340" stroke="black" strokeWidth="2" />
            <Line x1="70" y1="340" x2="270" y2="340" stroke="black" strokeWidth="2" />
          </>
        )}

        {mode === "DIV" && (
          <>
            {/* ========= R1 (mais abaixo e mais à esquerda) ========= */}

            {/* fio de conexão com o VCC */}
            <Line x1="230" y1="80" x2="120" y2="80" stroke="black" strokeWidth="2" />

            {/* fio descendo do barramento VCC */}
            <Line x1="120" y1="80" x2="120" y2="150" stroke="black" strokeWidth="2" />

            {/* R1 */}
            <Path
              d="M120 150
         L110 160
         L130 170
         L110 180
         L130 190
         L110 200
         L120 210"
              stroke="black"
              fill="none"
              strokeWidth="2"
            />

            <SvgText x="85" y="185" fontSize="14" fontWeight="bold">
              R1
            </SvgText>

            {/* ========= NÓ DA BASE (horizontal real agora) ========= */}

            {/* fio horizontal até a base */}
            <Line x1="120" y1="210" x2="210" y2="210" stroke="black" strokeWidth="2" />

            {/* pequeno ajuste vertical até o centro da base */}
            <Line x1="210" y1="210" x2="210" y2="220" stroke="black" strokeWidth="2" />

            {/* ========= R2 ========= */}

            <Path
              d="M120 210
         L110 220
         L130 230
         L110 240
         L130 250
         L110 260
         L120 270"
              stroke="black"
              fill="none"
              strokeWidth="2"
            />

            <SvgText x="85" y="245" fontSize="14" fontWeight="bold">
              R2
            </SvgText>

            {/* fio até GND */}
            <Line x1="120" y1="270" x2="120" y2="340" stroke="black" strokeWidth="2" />
            <Line x1="120" y1="340" x2="270" y2="340" stroke="black" strokeWidth="2" />

            {/* ========= RE ========= */}

            <Path
              d="M240 265
         L230 275
         L250 285
         L230 295
         L250 305
         L230 315
         L240 325"
              stroke="black"
              fill="none"
              strokeWidth="2"
            />

            <SvgText x="260" y="305" fontSize="14" fontWeight="bold">
              RE
            </SvgText>

            {/* RE até GND */}
            <Line x1="240" y1="325" x2="240" y2="340" stroke="black" strokeWidth="2" />
            <Line x1="240" y1="340" x2="270" y2="340" stroke="black" strokeWidth="2" />
          </>
        )}
      </Svg>
    </Animated.View>
  );
}