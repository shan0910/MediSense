
function myFunction() {
    var x = document.getElementById("mynavbar");
    if (x.className === "navbar") {
      x.className += " responsive";
    } else {
      x.className = "navbar";
    }
  }
  
 // Show Popup
function showPopup(message) {
  const popup = document.getElementById('popupMessage');
  popup.querySelector('p').textContent = message;
  popup.style.display = 'block';

  setTimeout(() => {
      popup.style.display = 'none';
      window.location.href = '/';  // Redirect after popup disappears
  }, 3000);
}

// Close Popup
function closePopup() {
  document.getElementById('popupMessage').style.display = 'none';
}

document.addEventListener('DOMContentLoaded', () => {
  const appointmentForm = document.getElementById('appointmentForm');
  if (!appointmentForm) {
      console.error('Appointment form not found!');
      return;
  }

  appointmentForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      console.log('Appointment form submitted');
      alert("✅ Appointment booked successfully!");

      const formData = {
          patientName: document.getElementsByName('patientName')[0].value,
          age: document.getElementsByName('age')[0].value,
          mobileNumber: document.getElementsByName('mobileNumber')[0].value,
          gender: document.getElementsByName('gender')[0].value,
          country: document.getElementsByName('country')[0].value,
          specialist: document.getElementsByName('specialist')[0].value
      };

      try {
          const response = await fetch('/api/appointment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(formData)
          });

          const result = await response.json();
          console.log('Appointment response:', result);
          alert("Response received: " + JSON.stringify(result));  // Debug alert

          if (response.ok) {
            alert('Registration successful!');
          } else {
              alert(result.message || 'Appointment creation failed');
          }
      } catch (error) {
          console.error('Error submitting appointment:', error);
          alert('An error occurred while creating the appointment.');
      }
  });
});





// Diabetes Form Submission
document.getElementById('diabetesForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = {
  
    pregnancies: e.target.pregnancies.value,
    glucose: e.target.glucose.value,
    bloodPressure: e.target.bloodPressure.value,
    skinThickness: e.target.skinThickness.value,
    insulin: e.target.insulin.value,
    bmi: e.target.bmi.value,
    diabetesPedigreeFunction: e.target.diabetesPedigreeFunction.value,
    age: e.target.age.value
  };

  // Form Submission to Backend
  try {
    const response = await fetch('/api/disease-prediction/diabetes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });

    const result = await response.json();

    if (response.ok) {
      // Redirect to display prediction result
      window.location.href = `/disease-prediction/diabetes?predictionId=${result.predictionId}`;
    } else {
      showPopup(result.error || 'Prediction failed');
    }
  } catch (error) {
    showPopup('Network error - please try again');
  }
});



document.getElementById('heartForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const token = localStorage.getItem('token');

  const formData = {
    age: e.target.age.value,
    sex: e.target.sex.value,
    cp: e.target.cp.value,
    trestbps: e.target.trestbps.value,
    // Add all other heart form fields
  };

  // Similar fetch call with authorization header
});


function diabetes() {
    document.getElementById("diabetes").style.display = "block";
  }
  function diabetesForm() {
    document.getElementById("diabetes").style.display = "none";
  } 
  
  function heart(){
    document.getElementById("heart").style.display = "block";
  }
  
  function heartForm(){
    document.getElementById("heart").style.display = "none";
  } 
  function liver(){
    document.getElementById("liver").style.display = "block";
  }
  
  function liverForm(){
    document.getElementById("liver").style.display = "none";
  } 

  function kidney(){
    document.getElementById("kidney").style.display = "block";
  }

  function kidneyForm(){
    document.getElementById("kidney").style.display = "none";
  } 

  
  function openForm() {
    document.getElementById("myForm").style.display = "block";
  }
  
  function closeForm() {
    document.getElementById("myForm").style.display = "none";
  } 
    