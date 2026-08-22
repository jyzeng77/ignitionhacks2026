import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Master list of all educational challenge questions
const ALL_CHALLENGES: Record<string, any[]> = {
  '📈 Trading & Investing': [
    { id: 1, text: "Which asset generally represents an ownership stake in a corporation?", options: ["Bonds", "Stocks", "Mutual Funds", "Commodities"], correct: 1 },
    { id: 2, text: "What strategy involves regularly buying a fixed dollar amount of an asset regardless of price?", options: ["Day Trading", "Short Selling", "Dollar-Cost Averaging", "Options Layering"], correct: 2 }
  ],
  '🎓 Tuition & Education': [
    { id: 1, text: "Which type of student loan typically accrues interest while you are still in school?", options: ["Subsidized Federal Loan", "Unsubsidized Federal Loan", "Direct Plus Loan", "Private Loan Only"], correct: 1 },
    { id: 2, text: "What is the primary tax advantage of a 529 savings plan?", options: ["Tax-deferred growth & tax-free withdrawals for education", "Immediate matching contributions from the government", "Guaranteed returns on state bonds", "Deductions on normal health expenses"], correct: 0 }
  ],
  '🏠 Household Management': [
    { id: 1, text: "In a standard 50/30/20 budget framework, what category does your rent or mortgage fall under?", options: ["Wants", "Savings & Debt", "Needs", "Investments"], correct: 2 },
    { id: 2, text: "What is the ideal recommended baseline for a household emergency fund?", options: ["1 week of grocery money", "3 to 6 months of living expenses", "10% of total house value", "Exactly $1,000 flat"], correct: 1 }
  ],
  '💳 Credit & Debt': [
    { id: 1, text: "Which factor impacts your credit score the heaviest?", options: ["Types of credit used", "Payment history", "Total amount of open accounts", "Length of employment"], correct: 1 },
    { id: 2, text: "What happens if you only make the minimum payment on a credit card balance each month?", options: ["Your score instantly drops 100 points", "You build credit faster without any fees", "You pay significantly more interest over a longer timeline", "The credit limit gets frozen automatically"], correct: 2 }
  ],
  '💰 Saving Money': [
    { id: 1, text: "What type of account is optimized to earn higher interest on static cash reserves?", options: ["Checking Account", "High-Yield Savings Account (HYSA)", "Digital Wallet Balance", "Brokerage Margin Account"], correct: 1 },
    { id: 2, text: "How does compound interest behave over long periods?", options: ["It decreases linearly", "It earns interest only on your initial principal amount", "It earns interest on both principal and accumulated interest", "It stays fixed regardless of the timeline"], correct: 2 }
  ]
};

export default function EduCrashon() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [loading, setLoading] = useState(true);
  const [tailoredQuestions, setTailoredQuestions] = useState<any[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [userProfileSummary, setUserProfileSummary] = useState({ topic: '', level: '' });

  useEffect(() => {
    if (params.onboardingData) {
      try {
        const rawAnswers = JSON.parse(params.onboardingData as string);
        const primaryTopic = rawAnswers[0] || '💰 Saving Money'; 
        const expertiseLevel = rawAnswers[1] || '🌱 Complete Beginner';

        setUserProfileSummary({ topic: primaryTopic, level: expertiseLevel });

        // Fetch tailored base questions. If not found, default to general saving topics.
        let baseQuestions = ALL_CHALLENGES[primaryTopic] || ALL_CHALLENGES['💰 Saving Money'];

        // Inject adaptive difficulty context adjustments straight into the question subtitles
        const contextualQuestions = baseQuestions.map(q => ({
          ...q,
          difficultyCue: expertiseLevel.includes('Advanced') || expertiseLevel.includes('knowledgeable')
            ? `🔥 Pro Level Challenge — Testing your deep comprehension`
            : `🌱 Foundational Challenge — Step-by-step guidance tailored for you`
        }));

        setTailoredQuestions(contextualQuestions);
      } catch (e) {
        setTailoredQuestions(ALL_CHALLENGES['💰 Saving Money']);
      } finally {
        setLoading(false);
      }
    }
  }, [params.onboardingData]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#3ecf8e" />
        <Text style={styles.loadingText}>Tailoring your personal learning tracks...</Text>
      </SafeAreaView>
    );
  }

  const currentQuestion = tailoredQuestions[currentIdx];

  const handleOptionPress = (index: number) => {
    if (selectedOpt !== null) return; // Prevent double taps
    setSelectedOpt(index);
    if (index === currentQuestion.correct) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    setSelectedOpt(null);
    if (currentIdx < tailoredQuestions.length - 1) {
      setCurrentIdx(prev => prev + 1);
    } else {
      setShowResults(true);
    }
  };

  if (showResults) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.centerContent}>
          <Text style={styles.emoji}>🎓</Text>
          <Text style={styles.title}>Challenge Complete!</Text>
          <Text style={styles.subtitle}>
            Great job! You wrapped up your custom session tailored to your interest in **{userProfileSummary.topic}** at a **{userProfileSummary.level}** stage.
          </Text>

          <View style={styles.scoreCard}>
            <Text style={styles.scoreLabel}>Final Score</Text>
            <Text style={styles.scoreValue}>{score} / {tailoredQuestions.length}</Text>
          </View>

          <Pressable style={styles.actionBtn} onPress={() => router.replace('./ratesync')}>
            <Text style={styles.actionBtnText}>Invest your interest</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Profile indicator badge */}
        <View style={styles.badgeRow}>
          <View style={styles.badge}><Text style={styles.badgeText}>{userProfileSummary.topic}</Text></View>
          <View style={styles.badge}><Text style={styles.badgeText}>{userProfileSummary.level}</Text></View>
        </View>

        <Text style={styles.stepCounter}>Question {currentIdx + 1} of {tailoredQuestions.length}</Text>
        <Text style={styles.cueText}>{currentQuestion?.difficultyCue}</Text>
        <Text style={styles.questionText}>{currentQuestion?.text}</Text>

        <View style={styles.optionsContainer}>
          {currentQuestion?.options.map((option: string, index: number) => {
            const isSelected = selectedOpt === index;
            const isCorrect = index === currentQuestion.correct;
            const isWrong = isSelected && !isCorrect;

            let optionStyle = [styles.optionBtn];
            if (selectedOpt !== null) {
              if (isCorrect) optionStyle.push(styles.correctBtn);
              if (isWrong) optionStyle.push(styles.wrongBtn);
            } else if (isSelected) {
              optionStyle.push(styles.selectedBtn);
            }

            return (
              <Pressable 
                key={option} 
                disabled={selectedOpt !== null}
                onPress={() => handleOptionPress(index)}
                style={optionStyle}
              >
                <Text style={styles.optionText}>{option}</Text>
                {selectedOpt !== null && isCorrect && <Text style={styles.feedbackMarker}>✓</Text>}
                {selectedOpt !== null && isWrong && <Text style={styles.feedbackMarker}>✗</Text>}
              </Pressable>
            );
          })}
        </View>

        {selectedOpt !== null && (
          <Pressable style={styles.nextBtn} onPress={handleNext}>
            <Text style={styles.nextBtnText}>
              {currentIdx === tailoredQuestions.length - 1 ? 'See Results' : 'Continue →'}
            </Text>
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B1020' },
  center: { justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#8E9AAF', marginTop: 15, fontSize: 16, fontWeight: '500' },
  content: { padding: 24, maxWidth: 600, width: '100%', alignSelf: 'center' },
  centerContent: { padding: 24, alignItems: 'center', justifyContent: 'center', flexGrow: 1 },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  badge: { backgroundColor: '#1C2E4A', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#20283D' },
  badgeText: { color: '#3ecf8e', fontSize: 12, fontWeight: '700' },
  stepCounter: { color: '#8E9AAF', fontSize: 14, fontWeight: '600', marginBottom: 4 },
  cueText: { color: '#3ecf8e', fontSize: 13, fontWeight: '500', marginBottom: 16 },
  questionText: { color: '#FFFFFF', fontSize: 22, fontWeight: '700', lineHeight: 30, marginBottom: 28 },
  optionsContainer: { gap: 14, marginBottom: 30 },
  optionBtn: { backgroundColor: '#161F38', borderWidth: 1, borderColor: '#20283D', padding: 18, borderRadius: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  selectedBtn: { borderColor: '#3ecf8e', backgroundColor: '#1C2E4A' },
  correctBtn: { borderColor: '#3ecf8e', backgroundColor: 'rgba(62, 207, 142, 0.15)' },
  wrongBtn: { borderColor: '#FF6B6B', backgroundColor: 'rgba(255, 107, 107, 0.15)' },
  optionText: { color: '#FFFFFF', fontSize: 16, fontWeight: '500', flex: 1 },
  feedbackMarker: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  nextBtn: { backgroundColor: '#3ecf8e', padding: 16, borderRadius: 14, alignItems: 'center' },
  nextBtnText: { color: '#0B1020', fontSize: 16, fontWeight: '700' },
  emoji: { fontSize: 64, marginBottom: 16 },
  title: { color: '#FFFFFF', fontSize: 26, fontWeight: '800', marginBottom: 12, textAlign: 'center' },
  subtitle: { color: '#8E9AAF', fontSize: 15, textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  scoreCard: { backgroundColor: '#161F38', borderRadius: 16, borderHorizontalWidth: 1, borderColor: '#20283D', padding: 24, width: '100%', alignItems: 'center', marginBottom: 32 },
  scoreLabel: { color: '#8E9AAF', fontSize: 14, fontWeight: '600', uppercase: true, trackingSpacing: 1, marginBottom: 4 },
  scoreValue: { color: '#3ecf8e', fontSize: 44, fontWeight: '800' },
  actionBtn: { backgroundColor: '#3ecf8e', paddingVertical: 16, paddingHorizontal: 32, borderRadius: 14, width: '100%', alignItems: 'center' },
  actionBtnText: { color: '#0B1020', fontSize: 16, fontWeight: '700' }
});