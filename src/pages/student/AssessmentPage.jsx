import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AppContext } from '../../context/AppContext';
import { assessmentService } from '../../services/apiService';
import Loading from '../../components/student/Loading';
import { FiArrowLeft, FiClock, FiCheckCircle, FiXCircle, FiAward, FiChevronLeft, FiChevronRight, FiSend, FiPlay, FiTarget, FiHelpCircle, FiRefreshCw } from 'react-icons/fi';

const AssessmentPage = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const { userData } = useContext(AppContext);

  const [loading, setLoading] = useState(true);
  const [assessmentInfo, setAssessmentInfo] = useState(null);
  const [attemptData, setAttemptData] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [results, setResults] = useState(null);
  const [showStartScreen, setShowStartScreen] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchAssessmentInfo = async () => {
    if (!userData?.id) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const response = await assessmentService.getAssessmentByCategory(categoryId, userData.id);
      if (response?.success) {
        setAssessmentInfo(response.data);
      } else {
        toast.error('Failed to load assessment');
      }
    } catch (error) {
      console.error('Error fetching assessment:', error?.message || 'Request failed');
      toast.error('Failed to load assessment');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssessmentInfo();
  }, [categoryId, userData?.id, refreshKey]);

  useEffect(() => {
    if (!attemptData || timeRemaining === null || timeRemaining <= 0) return;
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [attemptData, timeRemaining]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartAssessment = async (bypassCooldown = false) => {
    if (!userData?.id) {
      toast.error('Please login to take the assessment');
      return;
    }
    try {
      setLoading(true);
      const response = await assessmentService.startAssessment(userData.id, categoryId, bypassCooldown);
      if (response?.success) {
        setAttemptData(response.data);
        setTimeRemaining(response.data.time_limit_minutes * 60);
        setShowStartScreen(false);
        setAnswers({});
        setCurrentQuestionIndex(0);
      } else {
        toast.error(response?.error || 'Failed to start assessment');
      }
    } catch (error) {
      // Safely extract error message - error should be safe object from interceptor
      let errorMessage = 'Failed to start assessment';
      try {
        if (typeof error === 'string') {
          errorMessage = error;
        } else if (error?.error && typeof error.error === 'string') {
          errorMessage = error.error;
        } else if (error?.message && typeof error.message === 'string') {
          errorMessage = error.message;
        }
      } catch (e) {
        // If even this fails, use default message
      }
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionId, answer) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const goToQuestion = (index) => setCurrentQuestionIndex(index);
  const goToNext = () => currentQuestionIndex < attemptData.questions.length - 1 && setCurrentQuestionIndex(prev => prev + 1);
  const goToPrev = () => currentQuestionIndex > 0 && setCurrentQuestionIndex(prev => prev - 1);

  const handleSubmit = async (autoSubmit = false) => {
    if (!autoSubmit) {
      const unanswered = attemptData.questions.filter(q => !answers[q.id]).length;
      if (unanswered > 0 && !window.confirm(`You have ${unanswered} unanswered question(s). Submit anyway?`)) return;
    }
    try {
      setIsSubmitting(true);
      const response = await assessmentService.submitAssessment(attemptData.attempt_id, answers);
      if (response?.success) {
        setResults(response.data);
        setAttemptData(null);
      } else {
        toast.error(response?.error || 'Failed to submit assessment');
      }
    } catch (error) {
      // Safely extract error message
      let errorMessage = 'Failed to submit assessment';
      try {
        if (typeof error === 'string') {
          errorMessage = error;
        } else if (error?.error && typeof error.error === 'string') {
          errorMessage = error.error;
        } else if (error?.message && typeof error.message === 'string') {
          errorMessage = error.message;
        }
      } catch (e) {
        // If even this fails, use default message
      }
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <Loading />;

  if (!userData?.id) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8 pb-24">
        <div className="text-center p-8 bg-gradient-to-br from-[#1E90FF] to-[#00BFFF] rounded-3xl shadow-2xl shadow-blue-500/30">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiHelpCircle className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Login Required</h2>
          <p className="text-white/80 mb-6">Please login to take the assessment</p>
          <button onClick={() => navigate('/')} className="px-8 py-3 bg-white text-[#1E90FF] rounded-xl font-semibold hover:bg-gray-100 transition-all">
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  if (!assessmentInfo?.is_enabled) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8 pb-24">
        <div className="text-center p-8 bg-gradient-to-br from-[#1E90FF] to-[#00BFFF] rounded-3xl shadow-2xl shadow-blue-500/30">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiXCircle className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Not Available</h2>
          <p className="text-white/80 mb-6">Assessment is not enabled for this category</p>
          <button onClick={() => navigate(-1)} className="px-8 py-3 bg-white text-[#1E90FF] rounded-xl font-semibold hover:bg-gray-100 transition-all">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Results Screen - Modern glassmorphism design
  if (results) {
    const percentage = parseFloat(results.score_percentage);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 pb-24">
        <div className="w-full max-w-2xl">
          <div className={`relative overflow-hidden rounded-3xl p-8 ${results.passed ? 'bg-gradient-to-br from-emerald-500 to-teal-500' : 'bg-gradient-to-br from-[#1E90FF] to-[#00BFFF]'} shadow-2xl shadow-blue-500/30`}>
            {/* Animated background circles */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
            
            <div className="relative z-10">
              {/* Result Icon */}
              <div className="flex justify-center mb-6">
                <div className={`w-24 h-24 rounded-full flex items-center justify-center ${results.passed ? 'bg-emerald-500/30' : 'bg-red-500/30'}`}>
                  {results.passed ? <FiCheckCircle className="w-12 h-12 text-emerald-400" /> : <FiXCircle className="w-12 h-12 text-red-400" />}
                </div>
              </div>

              <h1 className="text-3xl font-bold text-center mb-2 text-white">
                {results.passed ? '🎉 Congratulations!' : 'Keep Learning!'}
              </h1>
              <p className="text-center text-white/80 mb-8">
                {results.passed ? 'You passed and earned a certificate!' : 'You can try again to improve your score.'}
              </p>

              {/* Score Circle */}
              <div className="flex justify-center mb-8">
                <div className="relative w-32 h-32">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="64" cy="64" r="56" stroke="rgba(255,255,255,0.1)" strokeWidth="12" fill="none" />
                    <circle cx="64" cy="64" r="56" stroke={results.passed ? '#10b981' : '#ef4444'} strokeWidth="12" fill="none" strokeLinecap="round"
                      strokeDasharray={`${(percentage / 100) * 352} 352`} className="transition-all duration-1000" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-bold text-white">{percentage}%</span>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-3 mb-8">
                {[
                  { label: 'Correct', value: results.correct_answers },
                  { label: 'Wrong', value: results.wrong_answers },
                  { label: 'Skipped', value: results.unanswered },
                  { label: 'Passing', value: `${results.passing_percentage}%` },
                ].map((stat, i) => (
                  <div key={i} className="bg-white/20 rounded-2xl p-4 text-center">
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                    <p className="text-xs text-white/70 mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 justify-center">
                {results.passed && results.certificate && (
                  <button onClick={() => navigate(`/certificate/${results.certificate.certificate_number}`)}
                    className="flex items-center gap-2 px-6 py-3 bg-white text-emerald-600 rounded-xl font-semibold hover:bg-gray-100 transition-all">
                    <FiAward className="w-5 h-5" /> View Certificate
                  </button>
                )}
                <button onClick={() => navigate('/my-enrollments')}
                  className="px-6 py-3 bg-white/20 text-white rounded-xl font-semibold hover:bg-white/30 transition-all">
                  My Enrollments
                </button>
                {!results.passed && assessmentInfo.allow_retake && assessmentInfo.attempts_remaining > 0 && (
                  <button onClick={() => { setResults(null); setShowStartScreen(true); setRefreshKey(prev => prev + 1); }}
                    className="flex items-center gap-2 px-6 py-3 bg-white text-[#1E90FF] rounded-xl font-semibold hover:bg-gray-100 transition-all">
                    <FiRefreshCw className="w-5 h-5" /> Try Again
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Start Screen - Modern card design
  if (showStartScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 pb-24">
        <div className="w-full max-w-xl">
          {/* Back Button */}
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 transition-colors">
            <FiArrowLeft className="w-5 h-5" /> Back to Topics
          </button>

          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0066CC] to-[#0099FF] p-8 shadow-2xl shadow-blue-500/30">
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
            
            <div className="relative z-10">
              {/* Header */}
              <div className="text-center mb-8">
                 
                <h1 className="text-2xl font-bold text-white mb-2 drop-shadow-lg">{assessmentInfo.category_name}</h1>
               </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {[
                  { icon: FiHelpCircle, label: 'Questions', value: assessmentInfo.total_questions },
                  { icon: FiClock, label: 'Duration', value: `${assessmentInfo.time_limit_minutes} min` },
                  { icon: FiTarget, label: 'Pass Score', value: `${assessmentInfo.passing_percentage}%` },
                  { icon: FiRefreshCw, label: 'Attempts Left', value: assessmentInfo.attempts_remaining ?? '∞' },
                ].map((stat, i) => (
                  <div key={i} className="bg-white rounded-2xl p-3 shadow-lg">
                    <div className="w-10 h-10 rounded-xl bg-[#0066CC] flex items-center justify-center mb-3">
                      <stat.icon className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                    <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Previous Attempts */}
              {assessmentInfo.attempts?.length > 0 && (
                <div className="mb-6">
                  <p className="text-sm text-white font-semibold mb-3">Previous Attempts</p>
                  <div className="space-y-2">
                    {assessmentInfo.attempts.slice(0, 2).map((attempt) => (
                      <div key={attempt.id} className={`flex justify-between items-center p-4 rounded-xl ${attempt.status === 'passed' ? 'bg-emerald-500 text-white' : 'bg-white'}`}>
                        <span className={`text-sm font-medium ${attempt.status === 'passed' ? 'text-white' : 'text-gray-700'}`}>Attempt #{attempt.attempt_number}</span>
                        <span className={`font-bold text-lg ${attempt.status === 'passed' ? 'text-white' : 'text-orange-500'}`}>
                          {attempt.score_percentage}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Certificate Badge */}
              {assessmentInfo.has_passed && assessmentInfo.certificate && (
                <div className="bg-emerald-500 rounded-2xl p-4 mb-6 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                      <FiAward className="w-6 h-6 text-emerald-500" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-white">Certificate Earned!</p>
                      <p className="text-xs text-white/90">{assessmentInfo.certificate.certificate_number}</p>
                    </div>
                    <button onClick={() => navigate(`/certificate/${assessmentInfo.certificate.certificate_number}`)}
                      className="px-4 py-2 bg-white text-emerald-600 rounded-lg text-sm font-bold hover:bg-gray-100 transition-colors shadow">
                      View
                    </button>
                  </div>
                </div>
              )}

              {/* Start Button */}
              {assessmentInfo.can_attempt ? (
                <button onClick={() => handleStartAssessment(false)}
                  className="w-full py-4 bg-white text-[#0066CC] rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:bg-gray-100 transition-all group shadow-lg">
                  <FiPlay className="w-6 h-6 group-hover:scale-110 transition-transform" /> Start Assessment
                </button>
              ) : assessmentInfo.has_passed ? (
                <div className="text-center py-4 bg-emerald-500 rounded-2xl shadow-lg">
                  <p className="text-white font-bold">✓ Already Passed</p>
                </div>
              ) : assessmentInfo.next_attempt_at ? (
                <div className="space-y-3">
                  <div className="text-center py-4 bg-white rounded-2xl shadow-lg">
                    <p className="text-gray-600 text-sm mb-1">Next attempt available on</p>
                    <p className="text-[#0066CC] font-bold text-lg">
                      {new Date(assessmentInfo.next_attempt_at).toLocaleString('en-IN', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </p>
                  </div>
                  {/* TEST BUTTON - Remove in production */}
                  <button onClick={() => handleStartAssessment(true)}
                    className="w-full py-3 bg-orange-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-orange-600 transition-all">
                    <FiPlay className="w-5 h-5" /> TEST: Start Anyway (Dev Only)
                  </button>
                </div>
              ) : assessmentInfo.attempts_remaining === 0 ? (
                <div className="text-center py-4 bg-white rounded-2xl shadow-lg">
                  <p className="text-red-500 font-semibold">Maximum attempts reached</p>
                </div>
              ) : (
                <button onClick={() => handleStartAssessment(false)}
                  className="w-full py-4 bg-white text-[#0066CC] rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:bg-gray-100 transition-all group shadow-lg">
                  <FiPlay className="w-6 h-6 group-hover:scale-110 transition-transform" /> Start Assessment
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Question Screen - Modern full-height layout
  const currentQuestion = attemptData?.questions[currentQuestionIndex];
  const answeredCount = Object.keys(answers).length;
  const progress = ((currentQuestionIndex + 1) / attemptData.questions.length) * 100;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 pb-24">
      {/* Top Bar */}
      <div className="flex-shrink-0 px-4 py-3 bg-gradient-to-r from-[#1E90FF] to-[#00BFFF] shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-white font-semibold">{assessmentInfo.category_name}</span>
            <span className="text-white/70 text-sm">Q {currentQuestionIndex + 1}/{attemptData.questions.length}</span>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono font-bold ${
            timeRemaining < 60 ? 'bg-red-500 text-white animate-pulse' : 
            timeRemaining < 300 ? 'bg-yellow-400 text-gray-900' : 'bg-white/20 text-white'
          }`}>
            <FiClock className="w-4 h-4" />
            {formatTime(timeRemaining)}
          </div>
        </div>
        {/* Progress Bar */}
        <div className="max-w-4xl mx-auto mt-3">
          <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-white transition-all duration-300" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full p-4">
          {/* Question Card */}
          <div className="flex-1 flex flex-col bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Question Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
              <span className="text-gray-500 font-medium">Question {currentQuestionIndex + 1}</span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                currentQuestion.difficulty === 'easy' ? 'bg-emerald-100 text-emerald-600' :
                currentQuestion.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-600'
              }`}>
                {currentQuestion.difficulty?.toUpperCase()}
              </span>
            </div>

            {/* Question Text */}
            <div className="px-6 py-6">
              <h2 className="text-xl font-semibold text-gray-800 leading-relaxed">
                {currentQuestion.question_text}
              </h2>
            </div>

            {/* Options */}
            <div className="flex-1 px-6 pb-6 overflow-y-auto">
              <div className="grid gap-3">
                {['A', 'B', 'C', 'D'].map((option) => {
                  const optionKey = `option_${option.toLowerCase()}`;
                  const isSelected = answers[currentQuestion.id] === option;
                  return (
                    <button key={option} onClick={() => handleAnswerSelect(currentQuestion.id, option)}
                      className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
                        isSelected 
                          ? 'border-[#1E90FF] bg-blue-50' 
                          : 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100'
                      }`}>
                      <div className="flex items-center gap-4">
                        <span className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg ${
                          isSelected ? 'bg-[#1E90FF] text-white' : 'bg-gray-200 text-gray-500'
                        }`}>
                          {option}
                        </span>
                        <span className="text-gray-700 flex-1">{currentQuestion[optionKey]}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bottom Navigation */}
          <div className="flex-shrink-0 flex items-center justify-between gap-4 mt-4">
            <button onClick={goToPrev} disabled={currentQuestionIndex === 0}
              className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-300 transition-all">
              <FiChevronLeft className="w-5 h-5" /> Previous
            </button>

            {/* Question Dots */}
            <div className="hidden md:flex items-center gap-1 overflow-x-auto max-w-md px-2">
              {attemptData.questions.map((q, index) => {
                const isAnswered = answers[q.id];
                const isCurrent = index === currentQuestionIndex;
                return (
                  <button key={q.id} onClick={() => goToQuestion(index)}
                    className={`w-3 h-3 rounded-full flex-shrink-0 transition-all ${
                      isCurrent ? 'w-6 bg-[#1E90FF]' : isAnswered ? 'bg-emerald-500' : 'bg-gray-300 hover:bg-gray-400'
                    }`} />
                );
              })}
            </div>

            {currentQuestionIndex === attemptData.questions.length - 1 ? (
              <button onClick={() => handleSubmit(false)} disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-all disabled:opacity-50">
                <FiSend className="w-5 h-5" /> {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>
            ) : (
              <button onClick={goToNext}
                className="flex items-center gap-2 px-6 py-3 bg-[#1E90FF] text-white rounded-xl font-bold hover:bg-blue-600 transition-all">
                Next <FiChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Mobile Question Navigator */}
          <div className="md:hidden flex-shrink-0 mt-4 flex items-center justify-center gap-2 text-gray-500 text-sm">
            <span className="text-emerald-600">{answeredCount} answered</span>
            <span>•</span>
            <span>{attemptData.questions.length - answeredCount} remaining</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentPage;
