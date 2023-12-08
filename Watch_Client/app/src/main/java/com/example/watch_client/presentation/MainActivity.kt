/* While this template provides a good starting point for using Wear Compose, you can always
 * take a look at https://github.com/android/wear-os-samples/tree/main/ComposeStarter and
 * https://github.com/android/wear-os-samples/tree/main/ComposeAdvanced to find the most up to date
 * changes to the libraries and their usages.
 */

package com.example.watch_client.presentation

import android.Manifest
import android.content.pm.PackageManager
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.os.AsyncTask
import android.os.Bundle
import android.util.Log
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Devices
import androidx.compose.ui.tooling.preview.Preview
import androidx.wear.compose.material.MaterialTheme
import androidx.wear.compose.material.Text
import com.example.watch_client.R
import com.example.watch_client.presentation.theme.Watch_ClientTheme

import androidx.compose.ui.graphics.Color
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import java.io.DataOutputStream
import java.net.HttpURLConnection
import java.net.URL

import android.content.Context
import android.os.PowerManager


class MainActivity : ComponentActivity() {
    val BUFFER_SIZE = 10
    var avg_heart_rate = 0.0
    var old_intensity = -1
    var intensity = -1

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            WearApp()
        }

        val powerManager = getSystemService(Context.POWER_SERVICE) as PowerManager
        val wakeLock = powerManager.newWakeLock(PowerManager.SCREEN_BRIGHT_WAKE_LOCK or PowerManager.ACQUIRE_CAUSES_WAKEUP, "YourTag:WakeLock")
        wakeLock.acquire()


        Log.d("Fit Beat", "Watch started")

        // Ring buffer for average heart rate
        val ringBuffer = RingBuffer(BUFFER_SIZE)

        // Check if the app has the BODY_SENSORS permission
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.BODY_SENSORS) != PackageManager.PERMISSION_GRANTED) {
            // Request the permission
            ActivityCompat.requestPermissions(this, arrayOf(Manifest.permission.BODY_SENSORS), 1)

        } else {
            // Permission has already been granted
            // You can proceed with enabling the heart rate sensor
        }

        val mSensorManager = getSystemService(SENSOR_SERVICE) as SensorManager
        val heartRateSensor = mSensorManager.getDefaultSensor(Sensor.TYPE_HEART_RATE)

        val heartRateSensorListener: SensorEventListener = object : SensorEventListener {
            override fun onSensorChanged(event: SensorEvent) {
                val heartRateValue = event.values[0] // Heart rate value is stored in the first element of the values array
                Log.d("Heart rate", heartRateValue.toString())
                ringBuffer.add(heartRateValue.toDouble())

                if(ringBuffer.size() >= BUFFER_SIZE)
                {
                    var sum = 0.0
                    for (i in 0 until BUFFER_SIZE) {
                        sum += ringBuffer[i]
                    }

                    avg_heart_rate = sum / BUFFER_SIZE

                    val networkTask = NetworkTask()

                    if (avg_heart_rate < 80.0)
                    {
                        old_intensity = intensity
                        intensity = 0
                    }
                    else
                    {
                        old_intensity = intensity
                        intensity = 1
                    }

                    if (old_intensity != intensity)
                    {
                        networkTask.setDataValue(intensity)
                        networkTask.execute()
                    }

                }
                // Handle the heart rate value here
            }

            override fun onAccuracyChanged(sensor: Sensor, accuracy: Int) {
                // Handle accuracy changes if needed
            }
        }

        mSensorManager.registerListener(
            heartRateSensorListener,
            heartRateSensor,
            SensorManager.SENSOR_DELAY_NORMAL
        )
    }

    class NetworkTask : AsyncTask<Void, Void, Void>() {

        private var intensity_value: String = "0"

        fun setDataValue(value: Int) {
            if(value == 0)
            {
                this.intensity_value = "low"
            }
            else
            {
                this.intensity_value = "high"
            }
        }

        override fun doInBackground(vararg params: Void?): Void? {
            // Perform your network operations here
            // This method runs in a background thread
            val ipAddress = "wombat-meet-antelope.ngrok-free.app"
            //val ipAddress = "192.168.0.224"
            //val port = "3000"
            val data = "{" +
                    "\"user\": \"user_1\"," +
                    "\"device\": \"watch\"," +
                    "\"type\": \"intensity\"," +
                    "\"value\": \"$intensity_value\"" +
                    "}"

            try {
                val url = URL("https://$ipAddress/send-data")
                //val url = URL("https://$ipAddress:$port/send-data")
                val connection = url.openConnection() as HttpURLConnection
                connection.requestMethod = "POST"
                connection.setRequestProperty("Content-Type", "application/json")

                val outputStream = DataOutputStream(connection.outputStream)
                outputStream.writeBytes(data)
                outputStream.flush()
                outputStream.close()

                val responseCode = connection.responseCode
                if(responseCode == HttpURLConnection.HTTP_OK) {
                    Log.d("FitBeat", "HTTP response ok")
                } else {
                    Log.d("FitBeat", "HTTP response not ok")
                }

            } catch (e: Exception) {
                e.printStackTrace()
            }

            return null
        }

        override fun onPostExecute(result: Void?) {
            // Update the UI or perform any post-execution tasks
            // This method runs on the main UI thread
        }
    }

    class RingBuffer(capacity: Int) {
        private val buffer: DoubleArray
        private var size = 0
        private var head = 0
        private var tail = 0

        init {
            buffer = DoubleArray(capacity)
        }

        fun add(element: Double) {
            if (size == buffer.size) {
                head = (head + 1) % buffer.size
            }
            buffer[tail] = element
            tail = (tail + 1) % buffer.size
            size = Math.min(size + 1, buffer.size)
        }

        operator fun get(index: Int): Double {
            if (index < 0 || index >= size) {
                throw IndexOutOfBoundsException("Index: $index, Size: $size")
            }
            val actualIndex = (head + index) % buffer.size
            return buffer[actualIndex]
        }

        fun size(): Int {
            return size
        }
    }
}

@Composable
fun WearApp() {
    Watch_ClientTheme {
        /* If you have enough items in your list, use [ScalingLazyColumn] which is an optimized
         * version of LazyColumn for wear devices with some added features. For more information,
         * see d.android.com/wear/compose.
         */
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(MaterialTheme.colors.background),
            verticalArrangement = Arrangement.Center
        ) {
            Greeting()
        }
    }
}

@Composable
fun Greeting() {
    Text(
        modifier = Modifier.fillMaxWidth(),
        textAlign = TextAlign.Center,
        //color = MaterialTheme.colors.primary,
        color = Color.Red,
        text = "Fit Beat app started..."
    )
}

@Preview(device = Devices.WEAR_OS_SMALL_ROUND, showSystemUi = true)
@Composable
fun DefaultPreview() {
    WearApp()
}