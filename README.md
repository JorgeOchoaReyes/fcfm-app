# Food Calling Flow Manager 

Food with Speed, Accuracy, and Quality. 

# How to run 
 Requirements: 
- Android Studio 
- Physical Device for Peer-to-Peer 

Run: 
``` npm run android ``` 

## Force Java 17 Compatibility

Expo nearby connection only (not actually super sure but jdk 21 did not work for me) supports JDK 17 so force builds to be java 17. 

When you run ```npm run android``` it will fail but create a android file, now we edit this file. 

### 1. Open android/build.gradle and add this block to the very bottom of the file:

android/build.gradle 
```
subprojects {
    tasks.withType(JavaCompile) {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    tasks.withType(org.jetbrains.kotlin.gradle.tasks.KotlinCompile) {
        kotlinOptions {
            jvmTarget = "17"
        }
    }
}
```

### 2. Bypass Version Validation
```
kotlin.jvm.target.validation.mode = IGNORE
```

### 3. Rebuild

```
npm run android
```

# Create APK and OTA Update 

Run: 
``` npm run apk ```

For OTA Update you must create a new build first, then send the update to the EAS: 
``` npm run android ```

Then close exit the dev preview and run: 

``` npm run update ```