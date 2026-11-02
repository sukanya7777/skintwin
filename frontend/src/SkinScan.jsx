import { useRef, useState } from "react";
import axios from "axios";
import {
  Upload,
  Camera,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Sun,
  Moon,
  ShieldCheck,
} from "lucide-react";
import "./SkinScan.css";

const API_URL = "http://localhost:8000";

export default function SkinScan({ onBack }) {
  const inputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");

  const [recommendations, setRecommendations] = useState(null);
  const [recommendationLoading, setRecommendationLoading] = useState(false);
  const [recommendationError, setRecommendationError] = useState("");

  function selectFile(selectedFile) {
    if (!selectedFile) return;

    if (!["image/jpeg", "image/png"].includes(selectedFile.type)) {
      setError("Please select a JPG or PNG image.");
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("Your image must be smaller than 10 MB.");
      return;
    }

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setResults(null);
    setRecommendations(null);
    setRecommendationError("");
    setError("");
    setStatus("");
  }

  async function startScan() {
    if (!file) return;

    setLoading(true);
    setError("");
    setResults(null);
    setRecommendations(null);
    setRecommendationError("");
    setStatus("Uploading your photo...");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post(
        `${API_URL}/api/skin/scan`,
        formData
      );

      const taskId = response.data.task_id;
      if (!taskId) {
        throw new Error("The scan service did not return a task ID.");
      }

      setStatus("Your skin analysis is processing...");
      let completed = false;

      // Poll every 10 seconds, up to 3 minutes.
      for (let attempt = 0; attempt < 18; attempt++) {
        await new Promise((resolve) => setTimeout(resolve, 10000));

        const resultResponse = await axios.get(
          `${API_URL}/api/skin/scan/${taskId}`
        );

        const data = resultResponse.data.data;

        if (data?.task_status === "success") {
          console.log(
            "FULL YOUCAM ANALYSIS JSON:\n",
            JSON.stringify(data, null, 2)
          );

          if (!data.results) {
            throw new Error("The scan completed, but no results were returned.");
          }

          setResults(data.results);
          setStatus("Your skin analysis is ready!");
          completed = true;
          break;
        }

        if (data?.task_status === "error") {
          throw new Error(
            "YouCam could not process this photo. Try another clear selfie."
          );
        }

        setStatus("Analyzing your skin... Please wait.");
      }

      if (!completed) {
        setStatus(
          "Analysis is taking longer than expected. Please try again in a moment. Task ID: " +
            taskId
        );
      }
    } catch (err) {
      console.error(err);
      const detail = err.response?.data?.detail;
      setError(
        typeof detail === "string"
          ? detail
          : detail?.message || err.message || "Something went wrong."
      );
      setStatus("");
    } finally {
      setLoading(false);
    }
  }

  async function generateRecommendations() {
    if (!results) return;

    setRecommendationLoading(true);
    setRecommendationError("");
    setRecommendations(null);

    try {
      const response = await axios.post(
        `${API_URL}/api/skin/recommendations`,
        {
          results,
          concerns: [],
          sensitivities: [],
        }
      );

      if (!response.data?.recommendations) {
        throw new Error("The recommendation service returned an empty plan.");
      }

      setRecommendations(response.data.recommendations);
    } catch (err) {
      console.error("Recommendation error:", err);
      const detail = err.response?.data?.detail;
      setRecommendationError(
        typeof detail === "string"
          ? detail
          : detail?.message ||
              err.message ||
              "Unable to generate your skincare plan. Please try again."
      );
    } finally {
      setRecommendationLoading(false);
    }
  }

  const output = results?.output || [];
  const getMetric = (type) => output.find((item) => item.type === type);
  const overall = getMetric("all");
  const skinAge = getMetric("skin_age");
  const skinType = output.filter((item) => item.type === "hd_skin_type");

  const metrics = [
    ["hd_moisture", "Moisture"],
    ["hd_radiance", "Radiance"],
    ["hd_redness", "Redness"],
    ["hd_oiliness", "Oiliness"],
    ["hd_acne", "Acne"],
    ["hd_texture", "Texture"],
    ["hd_age_spot", "Age spots"],
  ];

  const regionalMetrics = [
    { type: "hd_pore", title: "Pore analysis" },
    { type: "hd_wrinkle", title: "Wrinkle analysis" },
  ];

  function regionName(region) {
    const names = {
      whole: "Whole face",
      forehead: "Forehead",
      nose: "Nose",
      cheek: "Cheek",
      glabellar: "Between eyebrows",
      crowfeet: "Crow's feet",
      periocular: "Eye area",
      nasolabial: "Smile lines",
      marionette: "Lower face",
    };

    return names[region] || region || "Other";
  }

  return (
    <div className="skin-scan-page">
      <header className="scan-header">
        <button className="scan-back" onClick={onBack}>
          <ArrowLeft size={18} />
          Back to dashboard
        </button>
        <span className="scan-brand">
          SkinTwin <Sparkles size={15} />
        </span>
      </header>

      <main className="scan-main">
        <div className="scan-heading">
          <span className="scan-eyebrow">YOUR SKIN JOURNEY STARTS HERE</span>
          <h1>Let's meet your skin.</h1>
          <p>
            Take a clear selfie to create your first SkinTwin profile. We'll use
            it as your baseline for tracking your skin journey.
          </p>
        </div>

        <section className="scan-card">
          <div className="scan-upload-area">
            {preview ? (
              <div className="scan-preview">
                <img src={preview} alt="Your selected selfie" />
                <button
                  className="scan-change"
                  onClick={() => inputRef.current?.click()}
                  disabled={loading}
                >
                  <RefreshCw size={15} /> Change photo
                </button>
              </div>
            ) : (
              <button
                className="scan-dropzone"
                onClick={() => inputRef.current?.click()}
              >
                <div className="scan-upload-icon">
                  <Camera size={30} />
                </div>
                <h3>Upload your selfie</h3>
                <p>Choose a clear, front-facing photo</p>
                <span className="scan-browse">
                  <Upload size={16} /> Choose photo
                </span>
                <small>JPG or PNG · Maximum 10 MB</small>
              </button>
            )}

            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png"
              hidden
              onChange={(event) => selectFile(event.target.files?.[0])}
            />
          </div>

          <div className="scan-guidelines">
            <h3>For the best analysis</h3>
            <ul>
              <li>
                <CheckCircle2 size={16} /> Face the camera directly
              </li>
              <li>
                <CheckCircle2 size={16} /> Use natural, even lighting
              </li>
              <li>
                <CheckCircle2 size={16} /> Avoid makeup and filters
              </li>
              <li>
                <CheckCircle2 size={16} /> Keep your face fully visible
              </li>
            </ul>
          </div>

          <button
            className="scan-submit"
            onClick={startScan}
            disabled={!file || loading}
          >
            {loading ? (
              <>
                <RefreshCw className="scan-spinner" size={18} /> Analyzing...
              </>
            ) : (
              <>
                <Sparkles size={18} /> Analyze my skin
              </>
            )}
          </button>

          {status && <p className="scan-status">{status}</p>}

          {error && (
            <div className="scan-error">
              <AlertCircle size={17} /> {error}
            </div>
          )}
        </section>

        {results && (
          <section className="scan-results">
            <div className="results-intro">
              <span className="scan-eyebrow">YOUR SKINTWIN BASELINE</span>
              <h2>Your skin, understood.</h2>
              <p>
                Your first skin analysis is complete. This is your starting
                point for tracking your skin journey.
              </p>
            </div>

            <div className="overall-score-card">
              <div>
                <span>Overall skin score</span>
                <small>YouCam UI score</small>
              </div>
              <strong>{overall?.score ?? "—"}</strong>
            </div>

            <div className="skin-type-card">
              <div>
                <span className="result-label">DETECTED SKIN TYPE</span>
                <h3>
                  {skinType.find((item) => item.region === "whole")
                    ?.skin_type || "Not available"}
                </h3>
              </div>

              <div className="skin-type-regions">
                {skinType.map((item, index) => (
                  <div key={`${item.region}-${index}`}>
                    <span>{regionName(item.region)}</span>
                    <strong>{item.skin_type || "—"}</strong>
                  </div>
                ))}
              </div>
            </div>

            {skinAge && (
              <div className="skin-age-card">
                <span>YOUCAM SKIN AGE ESTIMATE</span>
                <strong>{skinAge.score}</strong>
                <small>Years</small>
              </div>
            )}

            <div className="results-section-heading">
              <h3>Skin characteristics</h3>
              <p>Individual measurements from your scan.</p>
            </div>

            <div className="scan-result-grid">
              {metrics.map(([type, label]) => {
                const item = getMetric(type);

                return (
                  <div className="scan-result-item" key={type}>
                    <span>{label}</span>
                    <strong>{item?.ui_score ?? "—"}</strong>
                    <small>YouCam UI score</small>
                  </div>
                );
              })}
            </div>

            {regionalMetrics.map(({ type, title }) => {
              const items = output.filter((item) => item.type === type);
              if (!items.length) return null;

              return (
                <div className="regional-results" key={type}>
                  <div className="results-section-heading">
                    <h3>{title}</h3>
                    <p>Measurements across different facial regions.</p>
                  </div>

                  <div className="regional-grid">
                    {items.map((item, index) => (
                      <div
                        className="regional-item"
                        key={`${type}-${item.region}-${index}`}
                      >
                        <span>{regionName(item.region)}</span>
                        <strong>{item.ui_score ?? "—"}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            <p className="results-disclaimer">
              These are AI-generated skin analysis measurements, not medical
              diagnoses. Scores should be interpreted according to YouCam's
              metric definitions.
            </p>

            <div className="recommendation-trigger">
              <div>
                <span className="scan-eyebrow">
                  YOUR PERSONAL SKINCARE GUIDE
                </span>
                <h3>Ready to care for your skin?</h3>
                <p>
                  Get ingredient suggestions and a simple morning and evening
                  routine based on your detected skin type.
                </p>
              </div>

              <button
                className="scan-submit"
                onClick={generateRecommendations}
                disabled={recommendationLoading}
              >
                {recommendationLoading ? (
                  <>
                    <RefreshCw className="scan-spinner" size={18} />
                    Creating your skincare plan...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} /> Generate my skincare plan
                  </>
                )}
              </button>

              {recommendationError && (
                <div className="scan-error">
                  <AlertCircle size={17} /> {recommendationError}
                </div>
              )}
            </div>
          </section>
        )}

        {recommendations && (
          <section className="recommendation-results">
            <div className="results-intro">
              <span className="scan-eyebrow">YOUR SKINTWIN PLAN</span>
              <h2>A routine that starts with your skin.</h2>
              <p>
                Ingredient-focused guidance based on your scan. You can use
                these ingredient names when choosing skincare products.
              </p>
            </div>

            <div className="recommendation-skin-type">
              <span>YOUR SKIN TYPE</span>
              <h3>{recommendations.skin_type || "Not specified"}</h3>
              {recommendations.skin_type_source && (
                <small>{recommendations.skin_type_source}</small>
              )}
            </div>

            <div className="results-section-heading">
              <h3>Ingredients to look for</h3>
              <p>These are ingredient suggestions, not brand endorsements.</p>
            </div>

            <div className="ingredient-grid">
              {(recommendations.ingredients || []).map((ingredient, index) => (
                <article
                  className="ingredient-card"
                  key={`${ingredient.name || "ingredient"}-${index}`}
                >
                  <div className="ingredient-card-top">
                    <Sparkles size={17} />
                    <h4>{ingredient.name || "Skincare ingredient"}</h4>
                  </div>
                  {ingredient.benefit && <p>{ingredient.benefit}</p>}
                  {ingredient.use && (
                    <small>
                      <strong>How to use:</strong> {ingredient.use}
                    </small>
                  )}
                </article>
              ))}
            </div>

            <div className="routine-grid">
              <article className="routine-card">
                <div className="routine-heading">
                  <Sun size={20} />
                  <h3>Morning routine</h3>
                </div>
                <ol>
                  {(recommendations.morning_routine || []).map(
                    (step, index) => (
                      <li key={`morning-${index}`}>
                        <span className="routine-step-number">
                          {index + 1}
                        </span>
                        <span>
                          {typeof step === "string"
                            ? step
                            : step.step || step.name || JSON.stringify(step)}
                        </span>
                      </li>
                    )
                  )}
                </ol>
              </article>

              <article className="routine-card">
                <div className="routine-heading">
                  <Moon size={20} />
                  <h3>Evening routine</h3>
                </div>
                <ol>
                  {(recommendations.evening_routine || []).map(
                    (step, index) => (
                      <li key={`evening-${index}`}>
                        <span className="routine-step-number">
                          {index + 1}
                        </span>
                        <span>
                          {typeof step === "string"
                            ? step
                            : step.step || step.name || JSON.stringify(step)}
                        </span>
                      </li>
                    )
                  )}
                </ol>
              </article>
            </div>

            {recommendations.important_notes?.length > 0 && (
              <div className="recommendation-notes">
                <div className="routine-heading">
                  <ShieldCheck size={19} />
                  <h3>Important notes</h3>
                </div>
                <ul>
                  {recommendations.important_notes.map((note, index) => (
                    <li key={`note-${index}`}>
                      {typeof note === "string"
                        ? note
                        : note.text || JSON.stringify(note)}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <p className="results-disclaimer">
              This is general cosmetic skincare guidance, not a medical
              diagnosis or treatment plan. Patch-test new products, introduce
              active ingredients gradually, and consult a dermatologist for
              persistent or concerning skin problems.
            </p>
          </section>
        )}
      </main>
    </div>
  );
}
