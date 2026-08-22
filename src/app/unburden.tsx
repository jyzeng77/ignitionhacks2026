import { useState } from 'react';
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const questions = [
  {
    question: 'What would you like to learn about?',
    subtitle: 'Choose the financial topics that interest you most.',
    options: [
      '📈 Trading & Investing',
      '🎓 Tuition & Education',
      '🏠 Household Management',
      '💳 Credit & Debt',
      '💰 Saving Money',
    ],
  },
  {
    question: 'How would you describe your financial knowledge?',
    subtitle: 'There are no wrong answers!',
    options: [
      '🌱 Complete Beginner',
      '📚 I know the basics',
      '🧠 Pretty knowledgeable',
      '🚀 Advanced',
    ],
  },
  {
    question: 'What is your biggest financial goal?',
    subtitle: 'Pick the goal you want to work toward.',
    options: [
      '💵 Build my savings',
      '📈 Grow my investments',
      '🎓 Pay for education',
      '🏡 Manage household expenses',
      '🛡️ Become financially secure',
    ],
  },
  {
    question: 'Which topic sounds the most challenging?',
    subtitle: 'We can focus your learning journey here.',
    options: [
      '📊 Understanding investments',
      '🧾 Managing expenses',
      '💳 Understanding credit',
      '🏦 Banking & saving',
      '💸 Taxes & income',
    ],
  },
  {
    question: 'How do you prefer to learn?',
    subtitle: 'We will customize your experience.',
    options: [
      '🎮 Games & challenges',
      '🧩 Interactive scenarios',
      '📖 Short lessons',
      '🏆 Quizzes & competitions',
      '💡 Real-life examples',
    ],
  },
  {
    question: 'What kind of financial journey do you want?',
    subtitle: 'Choose the experience that sounds most fun.',
    options: [
      '🏎️ Build wealth from scratch',
      '🗺️ Master everyday finances',
      '📈 Become an investing expert',
      '🎓 Plan my future',
      '👑 Become a financial master',
    ],
  },
];

export default function HomeScreen() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [finished, setFinished] = useState(false);

  const question = questions[currentQuestion];
  const selectedAnswer = answers[currentQuestion];

  const selectAnswer = (answer: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answer;
    setAnswers(newAnswers);
  };

  const nextQuestion = () => {
    if (!selectedAnswer) return;

    if (currentQuestion === questions.length - 1) {
      setFinished(true);
      return;
    }

    setCurrentQuestion(currentQuestion + 1);
  };

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const restart = () => {
    setCurrentQuestion(0);
    setAnswers([]);
    setFinished(false);
  };

  if (finished) {
    return (
      <ThemedResults
        answers={answers}
        restart={restart}
      />
    );
  }

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>💰</Text>

          <Text style={styles.brand}>MoneyQuest</Text>

          <Text style={styles.questionCounter}>
            {currentQuestion + 1} / {questions.length}
          </Text>
        </View>

        {/* Progress bar */}
        <View style={styles.progressBackground}>
          <View
            style={[
              styles.progress,
              { width: `${progress}%` },
            ]}
          />
        </View>

        {/* Question */}
        <View style={styles.questionSection}>
          <Text style={styles.question}>
            {question.question}
          </Text>

          <Text style={styles.subtitle}>
            {question.subtitle}
          </Text>
        </View>

        {/* Answers */}
        <View style={styles.options}>
          {question.options.map((option) => {
            const isSelected = selectedAnswer === option;

            return (
              <Pressable
                key={option}
                onPress={() => selectAnswer(option)}
                style={({ pressed }) => [
                  styles.option,
                  isSelected && styles.selectedOption,
                  pressed && styles.pressedOption,
                ]}
              >
                <Text
                  style={[
                    styles.optionText,
                    isSelected && styles.selectedOptionText,
                  ]}
                >
                  {option}
                </Text>

                {isSelected && (
                  <View style={styles.checkCircle}>
                    <Text style={styles.check}>✓</Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>

        {/* Navigation */}
        <View style={styles.navigation}>
          {currentQuestion > 0 ? (
            <Pressable
              onPress={previousQuestion}
              style={styles.backButton}
            >
              <Text style={styles.backText}>← Back</Text>
            </Pressable>
          ) : (
            <View />
          )}

          <Pressable
            onPress={nextQuestion}
            disabled={!selectedAnswer}
            style={[
              styles.nextButton,
              !selectedAnswer && styles.disabledButton,
            ]}
          >
            <Text style={styles.nextText}>
              {currentQuestion === questions.length - 1
                ? 'Finish'
                : 'Continue'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ThemedResults({
  answers,
  restart,
}: {
  answers: string[];
  restart: () => void;
}) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.resultsContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.resultsEmoji}>🏆</Text>

        <Text style={styles.resultsTitle}>
          Your journey is ready!
        </Text>

        <Text style={styles.resultsSubtitle}>
          We've learned a little about what you want to accomplish.
          Your MoneyQuest adventure starts now.
        </Text>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>
            Your answers
          </Text>

          {answers.map((answer, index) => (
            <View key={`${answer}-${index}`} style={styles.summaryRow}>
              <Text style={styles.summaryNumber}>
                {index + 1}
              </Text>

              <Text style={styles.summaryAnswer}>
                {answer}
              </Text>
            </View>
          ))}
        </View>

        <Pressable style={styles.startButton}>
          <Text style={styles.startButtonText}>
            Start My Journey 🚀
          </Text>
        </Pressable>

        <Pressable onPress={restart} style={styles.restartButton}>
          <Text style={styles.restartText}>
            Retake questionnaire
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1020',
  },

  content: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
    maxWidth: 700,
    width: '100%',
    alignSelf: 'center',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },

  logo: {
    fontSize: 28,
    marginRight: 8,
  },

  brand: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    flex: 1,
  },

  questionCounter: {
    color: '#8E9AAF',
    fontSize: 14,
    fontWeight: '600',
  },

  progressBackground: {
    height: 7,
    backgroundColor: '#20283D',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 45,
  },

  progress: {
    height: '100%',
    backgroundColor: '#6C63FF',
    borderRadius: 10,
  },

  questionSection: {
    marginBottom: 30,
  },

  question: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 40,
    marginBottom: 12,
  },

  subtitle: {
    color: '#8E9AAF',
    fontSize: 16,
    lineHeight: 24,
  },

  options: {
    gap: 14,
  },

  option: {
    minHeight: 68,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#252D43',
    backgroundColor: '#151B2D',
    flexDirection: 'row',
    alignItems: 'center',
  },

  selectedOption: {
    borderColor: '#6C63FF',
    backgroundColor: '#1D1B3D',
  },

  pressedOption: {
    opacity: 0.75,
    transform: [{ scale: 0.985 }],
  },

  optionText: {
    color: '#D8DDEA',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },

  selectedOptionText: {
    color: '#FFFFFF',
  },

  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#6C63FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  check: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },

  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 32,
  },

  backButton: {
    paddingHorizontal: 18,
    paddingVertical: 14,
  },

  backText: {
    color: '#8E9AAF',
    fontSize: 16,
    fontWeight: '600',
  },

  nextButton: {
    backgroundColor: '#6C63FF',
    paddingHorizontal: 28,
    paddingVertical: 15,
    borderRadius: 14,
    minWidth: 125,
    alignItems: 'center',
  },

  disabledButton: {
    opacity: 0.35,
  },

  nextText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },

  resultsContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 50,
    maxWidth: 700,
    width: '100%',
    alignSelf: 'center',
  },

  resultsEmoji: {
    fontSize: 64,
    textAlign: 'center',
    marginBottom: 20,
  },

  resultsTitle: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 14,
  },

  resultsSubtitle: {
    color: '#8E9AAF',
    fontSize: 16,
    lineHeight: 25,
    textAlign: 'center',
    marginBottom: 30,
  },

  summaryCard: {
    backgroundColor: '#151B2D',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
  },

  summaryTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 16,
  },

  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#252D43',
  },

  summaryNumber: {
    color: '#6C63FF',
    fontSize: 14,
    fontWeight: '800',
    width: 30,
  },

  summaryAnswer: {
    color: '#D8DDEA',
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },

  startButton: {
    backgroundColor: '#6C63FF',
    paddingVertical: 17,
    borderRadius: 15,
    alignItems: 'center',
  },

  startButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },

  restartButton: {
    alignItems: 'center',
    paddingVertical: 18,
  },

  restartText: {
    color: '#8E9AAF',
    fontSize: 14,
    fontWeight: '600',
  },
});