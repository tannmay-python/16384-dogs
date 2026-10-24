var dogs = {"2": "Chihuahua", "4": "Pomeranian", "8": "Pug", "16": "Dachshund", "32": "Beagle", "64": "Shiba Inu", "128": "Corgi", "256": "French Bulldog", "512": "Border Collie", "1024": "Husky", "2048": "Golden Retriever", "4096": "Labrador", "8192": "German Shepherd", "16384": "Great Dane"};
function dogName(value) { return dogs[Math.min(value || 2, 16384)] || "Great Dane"; }
