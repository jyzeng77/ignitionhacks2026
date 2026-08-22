import { useRouter } from 'expo-router'; // Initialize navigation
import { useState } from 'react';
import {
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from './supabaseClient'; // Import your configured Supabase client

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
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  // This handles storing answers to Supabase AND passing them to the next page
  const generadiate = async () => {
    setSaving(true);
  try {
    const { data, error } = await supabase
      .from('user_onboarding')
      .insert([
        {
          topic: answers[0],
          knowledge_level: answers[1],
          financial_goal: answers[2],
          biggest_challenge: answers[3],
          learning_preference: answers[4],
          journey_type: answers[5],
        },
      ])
      .select();

    // 💡 ADD THIS LOG TO SEE WHAT DATA CAME BACK
    console.log("Database Response Data:", data);

    if (error) throw error;

    router.push({
      pathname: './educrashon',
      params: { onboardingData: JSON.stringify(answers) }
    });
  } catch (error: any) {
    // 💡 THIS WILL PRINT THE EXACT POSTGRES ERROR IN YOUR TERMINAL
    console.error("Supabase Error Details:", error);
    Alert.alert('Database Sync Error', error.message || 'Could not save data.');
  } finally {
    setSaving(false);
  }
  };

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

        <Pressable 
          onPress={generadiate} 
          disabled={saving} 
          style={[styles.startButton, saving && { opacity: 0.6 }]}
        >
          <Text style={styles.startButtonText}>
            {saving ? 'Saving Choices...' : 'Start My Journey 🚀'}
          </Text>
        </Pressable>

        <Pressable onPress={restart} disabled={saving} style={styles.restartButton}>
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
    backgroundColor: '#3ecf8e',
  },
  questionSection: {
    marginBottom: 30,
  },
  question: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    color: '#8E9AAF',
    fontSize: 16,
  },
  options: {
    marginBottom: 30,
  },
  option: {
    backgroundColor: '#161F38',
    padding: 18,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#20283D',},selectedOption: {borderColor: '#3ecf8e',backgroundColor: '#1C2E4A',},pressedOption: {opacity: 0.9,},optionText: {color: '#FFFFFF',fontSize: 16,fontWeight: '500',flex: 1,},selectedOptionText: {color: '#3ecf8e',fontWeight: '700',},checkCircle: {width: 22,height: 22,borderRadius: 11,backgroundColor: '#3ecf8e',justifyContent: 'center',alignItems: 'center',},check: {color: '#0B1020',fontSize: 12,fontWeight: 'bold',},navigation: {flexDirection: 'row',justifyContent: 'space-between',alignItems: 'center',marginTop: 10,},backButton: {paddingVertical: 12,},backText: {color: '#8E9AAF',fontSize: 16,fontWeight: '600',},nextButton: {backgroundColor: '#3ecf8e',paddingVertical: 14,paddingHorizontal: 32,borderRadius: 12,},disabledButton: {backgroundColor: '#20283D',opacity: 0.5,},nextText: {color: '#0B1020',fontSize: 16,fontWeight: '700',},resultsContent: {paddingHorizontal: 24,paddingTop: 40,paddingBottom: 40,alignItems: 'center',maxWidth: 500,width: '100%',alignSelf: 'center',},resultsEmoji: {fontSize: 64,marginBottom: 16,},resultsTitle: {color: '#FFFFFF',fontSize: 28,fontWeight: '800',textAlign: 'center',marginBottom: 8,},resultsSubtitle: {color: '#8E9AAF',fontSize: 16,textAlign: 'center',lineHeight: 24,marginBottom: 32,},summaryCard: {backgroundColor: '#161F38',borderRadius: 16,padding: 20,width: '100%',marginBottom: 32,borderWidth: 1,borderColor: '#20283D',},summaryTitle: {color: '#FFFFFF',fontSize: 18,fontWeight: '700',marginBottom: 16,},summaryRow: {flexDirection: 'row',alignItems: 'center',marginBottom: 12,},summaryNumber: {color: '#3ecf8e',fontWeight: '700',marginRight: 12,fontSize: 14,},summaryAnswer: {color: '#FFFFFF',fontSize: 15,},startButton: {backgroundColor: '#3ecf8e',paddingVertical: 16,borderRadius: 14,width: '100%',alignItems: 'center',marginBottom: 16,},startButtonText: {color: '#0B1020',fontSize: 18,fontWeight: '700',},restartButton: {paddingVertical: 12,},restartText: {color: '#8E9AAF',fontSize: 15,fontWeight: '600',},});