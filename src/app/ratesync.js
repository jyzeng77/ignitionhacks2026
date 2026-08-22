import React, { useEffect, useRef, useState } from "react";
import {
    Dimensions,
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { GameEngine } from "react-native-game-engine";
import { SafeAreaView } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");

// ============================================================
// PLACEHOLDER ASSETS
// Replace these with your own local Expo assets later.
// ============================================================

const CAR_IMAGE = {
  uri: "https://picsum.photos/seed/racing-car/500/300",
};

const DRIVER_IMAGE = {
  uri: "https://picsum.photos/seed/driver/300/300",
};

// ============================================================
// FINANCIAL PROFILE
// ============================================================

const PLAYER_PROFILE = {
  income: 3200,

  needs: [
    "rent",
    "food",
    "transportation",
    "school",
    "phone",
  ],

  wants: [
    "gaming",
    "restaurants",
    "clothing",
    "entertainment",
    "electronics",
  ],

  goals: [
    "emergency_fund",
    "save_for_purchase",
    "avoid_debt",
  ],
};

// ============================================================
// FINANCIAL EVENTS
// ============================================================

const EVENTS = [
  {
    id: 1,
    category: "NEED",
    title: "Your phone bill is due.",
    description:
      "Your monthly phone plan costs $70. You have enough money to pay it.",
    choices: [
      {
        text: "Pay the bill",
        correct: true,
        cash: -70,
        savings: 10,
        xp: 100,
        message:
          "Essential expense handled. Your financial engine stays stable.",
      },
      {
        text: "Buy something else instead",
        correct: false,
        cash: -100,
        savings: -20,
        xp: 20,
        message:
          "You prioritized a want over an upcoming need.",
      },
    ],
  },

  {
    id: 2,
    category: "WANT",
    title: "Limited-time gaming sale!",
    description:
      "A game you want is $80 today. You have $350 of flexible spending money.",
    choices: [
      {
        text: "Buy it",
        correct: false,
        cash: -80,
        savings: -10,
        xp: 30,
        message:
          "You can afford it, but it delays your savings goal.",
      },
      {
        text: "Wait and save",
        correct: true,
        cash: 0,
        savings: 60,
        xp: 100,
        message:
          "Excellent! You separated a want from a need.",
      },
    ],
  },

  {
    id: 3,
    category: "SAVING",
    title: "Emergency fund checkpoint",
    description:
      "You receive an unexpected $200. What should you do?",
    choices: [
      {
        text: "Put most of it into savings",
        correct: true,
        cash: -150,
        savings: 150,
        xp: 120,
        message:
          "Your emergency buffer just became stronger.",
      },
      {
        text: "Spend all $200",
        correct: false,
        cash: -200,
        savings: 0,
        xp: 15,
        message:
          "A surprise opportunity became a missed savings opportunity.",
      },
    ],
  },

  {
    id: 4,
    category: "TRANSPORT",
    title: "Your ride needs fuel.",
    description:
      "You need transportation to school/work tomorrow. Fuel will cost $45.",
    choices: [
      {
        text: "Pay for the fuel",
        correct: true,
        cash: -45,
        savings: 5,
        xp: 90,
        message:
          "Transportation is a need. You planned ahead.",
      },
      {
        text: "Spend the $45 on entertainment",
        correct: false,
        cash: -45,
        savings: -25,
        xp: 10,
        message:
          "A necessary expense was ignored for a want.",
      },
    ],
  },

  {
    id: 5,
    category: "BUDGET",
    title: "Restaurant temptation",
    description:
      "You've already spent most of your restaurant budget this month.",
    choices: [
      {
        text: "Cook at home",
        correct: true,
        cash: 0,
        savings: 75,
        xp: 110,
        message:
          "You protected your budget without eliminating fun forever.",
      },
      {
        text: "Order the expensive meal",
        correct: false,
        cash: -65,
        savings: -30,
        xp: 20,
        message:
          "That meal pushed you further away from your savings goal.",
      },
    ],
  },

  {
    id: 6,
    category: "DEBT",
    title: "Credit card checkpoint",
    description:
      "You have a $300 balance with interest beginning soon.",
    choices: [
      {
        text: "Pay down the balance",
        correct: true,
        cash: -300,
        savings: 80,
        xp: 150,
        message:
          "Reducing expensive debt improves your future cash flow.",
      },
      {
        text: "Only make a tiny payment",
        correct: false,
        cash: -30,
        savings: -10,
        xp: 30,
        message:
          "The balance remains and can continue costing you interest.",
      },
    ],
  },
];

// ============================================================
// GAME STATE
// ============================================================

const initialGameState = {
  speed: 62,
  cash: 850,
  savings: 420,
  xp: 0,
  lap: 1,
  distance: 37,
  eventActive: true,
};

// ============================================================
// GAME ENGINE SYSTEM
// ============================================================

const gameLoop = (entities, { time }) => {
  const player = entities.player;

  if (!player) {
    return entities;
  }

  player.speed += Math.sin(time.current / 400) * 0.15;

  if (player.speed > 100) {
    player.speed = 100;
  }

  if (player.speed < 0) {
    player.speed = 0;
  }

  return entities;
};

// ============================================================
// SPEEDOMETER
// ============================================================

function Gauge({ value, max, label, unit, danger }) {
  const percentage = Math.max(
    0,
    Math.min(value / max, 1)
  );

  return (
    <View style={styles.gaugeContainer}>
      <View style={styles.gaugeOuter}>
        <View style={styles.gaugeTicks}>
          {Array.from({ length: 11 }).map(
            (_, index) => (
              <View
                key={index}
                style={[
                  styles.tick,
                  {
                    transform: [
                      {
                        rotate: `${-125 + index * 25}deg`,
                      },
                    ],
                  },
                ]}
              />
            )
          )}
        </View>

        <View style={styles.gaugeCenter}>
          <Text style={styles.gaugeValue}>
            {Math.round(value)}
          </Text>

          <Text style={styles.gaugeUnit}>
            {unit}
          </Text>
        </View>

        <View
          style={[
            styles.needle,
            {
              transform: [
                {
                  rotate: `${-125 + percentage * 250}deg`,
                },
              ],
            },
          ]}
        />
      </View>

      <Text
        style={[
          styles.gaugeLabel,
          danger && styles.dangerText,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

// ============================================================
// MONEY GAUGE
// ============================================================

function MoneyGauge({ value, max, label }) {
  const percentage = Math.max(
    0,
    Math.min(value / max, 1)
  );

  return (
    <View style={styles.moneyGauge}>
      <View style={styles.moneyGaugeTop}>
        <Text style={styles.moneyGaugeLabel}>
          {label}
        </Text>

        <Text style={styles.moneyGaugeValue}>
          ${Math.max(0, Math.round(value))}
        </Text>
      </View>

      <View style={styles.moneyBar}>
        <View
          style={[
            styles.moneyFill,
            {
              width: `${percentage * 100}%`,
            },
          ]}
        />
      </View>
    </View>
  );
}

// ============================================================
// MINI STAT
// ============================================================

function MiniStat({ label, value, icon }) {
  return (
    <View style={styles.miniStat}>
      <Text style={styles.miniIcon}>
        {icon}
      </Text>

      <View>
        <Text style={styles.miniLabel}>
          {label}
        </Text>

        <Text style={styles.miniValue}>
          {value}
        </Text>
      </View>
    </View>
  );
}

// ============================================================
// MAIN GAME
// ============================================================

export default function FinancialRaceGame() {
  const [gameState, setGameState] = useState(
    initialGameState
  );

  const [eventIndex, setEventIndex] = useState(0);

  const [feedback, setFeedback] = useState(null);

  const [gameStarted, setGameStarted] =
    useState(false);

  const engineRef = useRef(null);

  const event = EVENTS[eventIndex];

  // ==========================================================
  // AUTOMATIC RACE MOVEMENT
  // ==========================================================

  useEffect(() => {
    if (!gameStarted || feedback) {
      return;
    }

    const timer = setInterval(() => {
      setGameState((previous) => ({
        ...previous,

        distance: Math.min(
          100,
          previous.distance +
            previous.speed / 1000
        ),
      }));
    }, 100);

    return () => clearInterval(timer);
  }, [gameStarted, feedback]);

  // ==========================================================
  // START RACE
  // ==========================================================

  function startRace() {
    setGameStarted(true);

    setGameState({
      ...initialGameState,
      eventActive: true,
    });
  }

  // ==========================================================
  // FINANCIAL DECISION
  // ==========================================================

  function chooseAnswer(choice) {
    const newCash = Math.max(
      0,
      gameState.cash + choice.cash
    );

    const newSavings = Math.max(
      0,
      gameState.savings + choice.savings
    );

    const newXP =
      gameState.xp + choice.xp;

    setGameState((previous) => ({
      ...previous,

      cash: newCash,

      savings: newSavings,

      xp: newXP,

      speed: choice.correct
        ? Math.min(
            100,
            previous.speed + 8
          )
        : Math.max(
            25,
            previous.speed - 12
          ),

      distance: choice.correct
        ? Math.min(
            100,
            previous.distance + 8
          )
        : Math.max(
            0,
            previous.distance - 4
          ),
    }));

    setFeedback({
      correct: choice.correct,
      message: choice.message,
    });
  }

  // ==========================================================
  // NEXT EVENT
  // ==========================================================

  function continueRace() {
    if (eventIndex >= EVENTS.length - 1) {
      setEventIndex(0);
    } else {
      setEventIndex(eventIndex + 1);
    }

    setFeedback(null);
  }

  // ==========================================================
  // START SCREEN
  // ==========================================================

  if (!gameStarted) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={
            styles.scrollContent
          }
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.startScreen}>
            <Text style={styles.logo}>
              FINANCE GP
            </Text>

            <Text style={styles.startTitle}>
              RACE YOUR{"\n"}
              FINANCIAL FUTURE
            </Text>

            <Text style={styles.startDescription}>
              Make everyday money decisions.
              Build savings, protect your cash
              flow, and reach the finish line.
            </Text>

            <View style={styles.previewCard}>
              <Image
                source={CAR_IMAGE}
                style={styles.previewCar}
              />

              <View style={styles.previewOverlay}>
                <Text style={styles.previewText}>
                  YOUR FINANCIAL VEHICLE
                </Text>

                <Text
                  style={styles.previewSubtext}
                >
                  Placeholder asset
                </Text>
              </View>
            </View>

            <View style={styles.goalRow}>
              <MiniStat
                icon="💵"
                label="Starting Cash"
                value="$850"
              />

              <MiniStat
                icon="🛡️"
                label="Savings"
                value="$420"
              />
            </View>

            <Pressable
              style={styles.startButton}
              onPress={startRace}
            >
              <Text
                style={styles.startButtonText}
              >
                START RACE →
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ==========================================================
  // MAIN RACE SCREEN
  // ==========================================================

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={
          styles.scrollContent
        }
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <GameEngine
          ref={engineRef}
          style={styles.engine}
          systems={[gameLoop]}
          entities={{
            player: {
              position: {
                x: 0,
                y: 0,
              },
            },
          }}
        >
          {/* ==================================================
              TOP HUD
          ================================================== */}

          <View style={styles.topHud}>
            <View>
              <Text style={styles.smallTitle}>
                FINANCE GP
              </Text>

              <Text style={styles.raceTitle}>
                MONACO OF MONEY
              </Text>
            </View>

            <View style={styles.lapBox}>
              <Text style={styles.lapLabel}>
                LAP
              </Text>

              <Text style={styles.lapNumber}>
                {gameState.lap}/5
              </Text>
            </View>
          </View>

          {/* ==================================================
              TRACK
          ================================================== */}

          <View style={styles.trackSection}>
            <View style={styles.trackRoad}>
              <View style={styles.trackLine} />

              <Image
                source={CAR_IMAGE}
                style={[
                  styles.raceCar,
                  {
                    left: `${Math.min(
                      gameState.distance,
                      88
                    )}%`,
                  },
                ]}
              />

              <View style={styles.finishLine} />
            </View>

            <View style={styles.trackLabels}>
              <Text style={styles.trackStart}>
                START
              </Text>

              <Text style={styles.trackFinish}>
                FINISH
              </Text>
            </View>
          </View>

          {/* ==================================================
              DASHBOARD
          ================================================== */}

          <View style={styles.dashboard}>
            <View style={styles.dashboardTop}>
              <Gauge
                value={gameState.speed}
                max={100}
                label="CASH FLOW"
                unit="%"
              />

              <View style={styles.driverSection}>
                <View style={styles.driverCircle}>
                  <Image
                    source={DRIVER_IMAGE}
                    style={styles.driverImage}
                  />
                </View>

                <Text style={styles.driverName}>
                  DRIVER
                </Text>

                <Text
                  style={styles.driverLevel}
                >
                  FINANCIAL LEVEL{" "}
                  {Math.floor(
                    gameState.xp / 300
                  ) + 1}
                </Text>
              </View>

              <Gauge
                value={Math.min(
                  100,
                  gameState.savings / 10
                )}
                max={100}
                label="SAFETY"
                unit="%"
                danger={
                  gameState.savings < 200
                }
              />
            </View>

            {/* ==================================================
                MONEY BARS
            ================================================== */}

            <View style={styles.moneySection}>
              <MoneyGauge
                value={gameState.cash}
                max={1500}
                label="AVAILABLE CASH"
              />

              <MoneyGauge
                value={gameState.savings}
                max={1500}
                label="EMERGENCY FUND"
              />
            </View>

            {/* ==================================================
                STATS
            ================================================== */}

            <View style={styles.statsRow}>
              <MiniStat
                icon="💰"
                label="CASH"
                value={`$${Math.round(
                  gameState.cash
                )}`}
              />

              <MiniStat
                icon="🛡️"
                label="SAVINGS"
                value={`$${Math.round(
                  gameState.savings
                )}`}
              />

              <MiniStat
                icon="⭐"
                label="XP"
                value={gameState.xp}
              />

              <MiniStat
                icon="🏁"
                label="DISTANCE"
                value={`${Math.round(
                  gameState.distance
                )}%`}
              />
            </View>
          </View>

          {/* ==================================================
              FINANCIAL EVENT
          ================================================== */}

          {gameState.eventActive && (
            <View style={styles.eventContainer}>
              <View style={styles.eventHeader}>
                <View
                  style={styles.categoryBadge}
                >
                  <Text
                    style={styles.categoryText}
                  >
                    {event.category}
                  </Text>
                </View>

                <Text
                  style={styles.eventNumber}
                >
                  DECISION {eventIndex + 1}/
                  {EVENTS.length}
                </Text>
              </View>

              <Text style={styles.eventTitle}>
                {event.title}
              </Text>

              <Text
                style={styles.eventDescription}
              >
                {event.description}
              </Text>

              {!feedback ? (
                <View
                  style={styles.choiceContainer}
                >
                  {event.choices.map(
                    (choice, index) => (
                      <Pressable
                        key={index}
                        style={[
                          styles.choiceButton,
                          index === 0
                            ? styles.primaryChoice
                            : styles.secondaryChoice,
                        ]}
                        onPress={() =>
                          chooseAnswer(choice)
                        }
                      >
                        <View
                          style={
                            styles.choiceNumber
                          }
                        >
                          <Text
                            style={
                              styles.choiceNumberText
                            }
                          >
                            {index + 1}
                          </Text>
                        </View>

                        <Text
                          style={styles.choiceText}
                        >
                          {choice.text}
                        </Text>

                        <Text
                          style={styles.choiceArrow}
                        >
                          →
                        </Text>
                      </Pressable>
                    )
                  )}
                </View>
              ) : (
                <View
                  style={
                    styles.feedbackContainer
                  }
                >
                  <Text
                    style={[
                      styles.feedbackTitle,
                      feedback.correct
                        ? styles.correct
                        : styles.incorrect,
                    ]}
                  >
                    {feedback.correct
                      ? "PERFECT DECISION"
                      : "FINANCIAL SETBACK"}
                  </Text>

                  <Text
                    style={
                      styles.feedbackMessage
                    }
                  >
                    {feedback.message}
                  </Text>

                  <View
                    style={
                      styles.feedbackStats
                    }
                  >
                    <Text
                      style={styles.feedbackXP}
                    >
                      +
                      {event.choices.find(
                        (c) =>
                          c.correct ===
                          feedback.correct
                      )?.xp || 0}{" "}
                      XP
                    </Text>

                    <Text
                      style={
                        styles.feedbackCash
                      }
                    >
                      CASH FLOW UPDATED
                    </Text>
                  </View>

                  <Pressable
                    style={
                      styles.continueButton
                    }
                    onPress={continueRace}
                  >
                    <Text
                      style={
                        styles.continueText
                      }
                    >
                      CONTINUE RACE →
                    </Text>
                  </Pressable>
                </View>
              )}
            </View>
          )}

          <View style={{ height: 40 }} />
        </GameEngine>
      </ScrollView>
    </SafeAreaView>
  );
}

// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#080A0F",
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    paddingBottom: 30,
  },

  engine: {
    minHeight: 850,
    backgroundColor: "#080A0F",
  },

  // ==========================================================
  // START SCREEN
  // ==========================================================

  startScreen: {
    minHeight: height,
    padding: 24,
    justifyContent: "center",
  },

  logo: {
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 4,
    color: "#A8FF60",
    marginBottom: 18,
  },

  startTitle: {
    fontSize: 42,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: -1,
    lineHeight: 42,
  },

  startDescription: {
    marginTop: 16,
    color: "#8E96A5",
    fontSize: 16,
    lineHeight: 24,
    maxWidth: 450,
  },

  previewCard: {
    height: 180,
    marginTop: 28,
    borderRadius: 22,
    overflow: "hidden",
    backgroundColor: "#12161E",
    borderWidth: 1,
    borderColor: "#242B37",
  },

  previewCar: {
    width: "100%",
    height: "100%",
    opacity: 0.7,
  },

  previewOverlay: {
    position: "absolute",
    left: 18,
    bottom: 16,
  },

  previewText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 12,
    letterSpacing: 2,
  },

  previewSubtext: {
    color: "#7F8794",
    marginTop: 4,
  },

  goalRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 18,
  },

  startButton: {
    marginTop: 24,
    height: 58,
    borderRadius: 16,
    backgroundColor: "#A8FF60",
    alignItems: "center",
    justifyContent: "center",
  },

  startButtonText: {
    color: "#080A0F",
    fontWeight: "900",
    fontSize: 16,
    letterSpacing: 1,
  },

  // ==========================================================
  // HUD
  // ==========================================================

  topHud: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingTop: 10,
  },

  smallTitle: {
    color: "#A8FF60",
    fontSize: 11,
    letterSpacing: 3,
    fontWeight: "900",
  },

  raceTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
    marginTop: 4,
  },

  lapBox: {
    alignItems: "center",
    backgroundColor: "#12161E",
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 12,
  },

  lapLabel: {
    color: "#6E7684",
    fontSize: 9,
    fontWeight: "800",
  },

  lapNumber: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "900",
  },

  // ==========================================================
  // TRACK
  // ==========================================================

  trackSection: {
    height: 105,
    marginTop: 8,
    paddingHorizontal: 18,
  },

  trackRoad: {
    height: 65,
    marginTop: 20,
    backgroundColor: "#171B22",
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#272D38",
    position: "relative",
  },

  trackLine: {
    position: "absolute",
    top: 31,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: "#4A505B",
  },

  raceCar: {
    position: "absolute",
    top: 10,
    width: 82,
    height: 46,
    resizeMode: "cover",
    borderRadius: 8,
  },

  finishLine: {
    position: "absolute",
    right: 15,
    top: 0,
    bottom: 0,
    width: 5,
    backgroundColor: "#FFFFFF",
  },

  trackLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 8,
  },

  trackStart: {
    color: "#596170",
    fontSize: 8,
    fontWeight: "800",
  },

  trackFinish: {
    color: "#A8FF60",
    fontSize: 8,
    fontWeight: "800",
  },

  // ==========================================================
  // DASHBOARD
  // ==========================================================

  dashboard: {
    marginHorizontal: 18,
    backgroundColor: "#10141B",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#252C37",
    padding: 14,
  },

  dashboardTop: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },

  // ==========================================================
  // GAUGES
  // ==========================================================

  gaugeContainer: {
    alignItems: "center",
    width: 120,
  },

  gaugeOuter: {
    width: 105,
    height: 105,
    borderRadius: 60,
    backgroundColor: "#080A0F",
    borderWidth: 8,
    borderColor: "#202630",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },

  gaugeTicks: {
    position: "absolute",
    width: 105,
    height: 105,
  },

  tick: {
    position: "absolute",
    width: 2,
    height: 8,
    backgroundColor: "#636B77",
    left: 51,
    top: 5,
  },

  gaugeCenter: {
    alignItems: "center",
  },

  gaugeValue: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "900",
  },

  gaugeUnit: {
    color: "#6E7684",
    fontSize: 8,
    fontWeight: "900",
  },

  needle: {
    position: "absolute",
    width: 3,
    height: 39,
    backgroundColor: "#A8FF60",
    bottom: 50,
    left: 51,
  },

  gaugeLabel: {
    marginTop: 5,
    color: "#A8FF60",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1,
  },

  dangerText: {
    color: "#FF6577",
  },

  // ==========================================================
  // DRIVER
  // ==========================================================

  driverSection: {
    alignItems: "center",
  },

  driverCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#A8FF60",
  },

  driverImage: {
    width: "100%",
    height: "100%",
  },

  driverName: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 10,
    marginTop: 6,
  },

  driverLevel: {
    color: "#626B79",
    fontSize: 7,
    marginTop: 2,
    letterSpacing: 1,
  },

  // ==========================================================
  // MONEY
  // ==========================================================

  moneySection: {
    marginTop: 12,
    gap: 8,
  },

  moneyGauge: {
    width: "100%",
  },

  moneyGaugeTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },

  moneyGaugeLabel: {
    color: "#747D8B",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1,
  },

  moneyGaugeValue: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "900",
  },

  moneyBar: {
    height: 6,
    borderRadius: 5,
    backgroundColor: "#252B34",
    overflow: "hidden",
  },

  moneyFill: {
    height: "100%",
    backgroundColor: "#A8FF60",
    borderRadius: 5,
  },

  // ==========================================================
  // STATS
  // ==========================================================

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#242A34",
    paddingTop: 10,
  },

  miniStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  miniIcon: {
    fontSize: 15,
  },

  miniLabel: {
    color: "#626B78",
    fontSize: 7,
    fontWeight: "800",
  },

  miniValue: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "900",
    marginTop: 1,
  },

  // ==========================================================
  // EVENT
  // ==========================================================

  eventContainer: {
    marginHorizontal: 18,
    marginTop: 12,
    marginBottom: 8,
    backgroundColor: "#151A22",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#29303B",
  },

  eventHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  categoryBadge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 7,
    backgroundColor: "#A8FF60",
  },

  categoryText: {
    color: "#080A0F",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1,
  },

  eventNumber: {
    color: "#5F6875",
    fontSize: 8,
    fontWeight: "900",
  },

  eventTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
    marginTop: 12,
  },

  eventDescription: {
    color: "#929AA7",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 6,
  },

  choiceContainer: {
    marginTop: 12,
    gap: 8,
  },

  choiceButton: {
    minHeight: 48,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
  },

  primaryChoice: {
    backgroundColor: "#A8FF60",
  },

  secondaryChoice: {
    backgroundColor: "#242A34",
  },

  choiceNumber: {
    width: 27,
    height: 27,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.15)",
  },

  choiceNumberText: {
    fontWeight: "900",
    color: "#FFFFFF",
  },

  choiceText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 12,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  choiceArrow: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
  },

  // ==========================================================
  // FEEDBACK
  // ==========================================================

  feedbackContainer: {
    marginTop: 14,
    padding: 14,
    borderRadius: 14,
    backgroundColor: "#0D1117",
  },

  feedbackTitle: {
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 1,
  },

  correct: {
    color: "#A8FF60",
  },

  incorrect: {
    color: "#FF6577",
  },

  feedbackMessage: {
    color: "#A1A9B5",
    marginTop: 7,
    fontSize: 12,
    lineHeight: 18,
  },

  feedbackStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },

  feedbackXP: {
    color: "#FFD45C",
    fontWeight: "900",
  },

  feedbackCash: {
    color: "#68717F",
    fontSize: 9,
    fontWeight: "900",
  },

  continueButton: {
    height: 45,
    backgroundColor: "#A8FF60",
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },

  continueText: {
    color: "#080A0F",
    fontWeight: "900",
    fontSize: 12,
    letterSpacing: 1,
  },
});