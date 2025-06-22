<template>
  <q-page class="q-pa-md">
    <q-card>
      <q-card-section>
        <div class="row q-col-gutter-lg">
          <div class="col-12 col-md-6">
            <h5>Common expressions used at sea</h5>
            <q-list bordered>
              <q-item
                v-for="(expression, idx) in expressions" 
                :key="idx"
              >
                <q-item-section>
                  <b>{{ expression.term }}</b>: {{ expression.meaning }}
                </q-item-section>
              </q-item>
            </q-list>
          </div>
          <div class="col-12 col-md-6">
            <h5>Video Guides</h5>
            <q-list bordered>
              <q-item 
                v-for="(video, idx) in videos" 
                :key="idx" 
                clickable 
                @click="openVideo(video)"
              >
                <q-item-section>
                  <q-icon 
                    name="play_circle" 
                    class="q-mr-sm" 
                    color="primary" 
                  />
                  <span class="text-primary">
                    {{ video.title }}</span>
                </q-item-section>
              </q-item>
            </q-list>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Video Modal -->
    <q-dialog v-model="videoDialog">
      <q-card style="max-width: 90vw; max-height: 80vh;">
        <q-card-section>
          <div class="text-h6">
            {{ selectedVideo?.title }}
          </div>
        </q-card-section>
        <q-card-section>
          <iframe
            v-if="selectedVideo"
            :src="selectedVideo.embedUrl"
            width="560"
            height="315"
            frameborder="0"
            allowfullscreen
            style="width:100%;height:50vh;"
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn 
            v-close-popup 
            flat 
            label="Close" 
            color="primary" 
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'

const expressions = [
  { term: "Abaft", meaning: "Toward the rear (stern) of the boat" },
  { term: "Bow", meaning: "Front of the boat" },
  { term: "Port", meaning: "Left side of the boat when facing forward" },
  { term: "Starboard", meaning: "Right side of the boat when facing forward" },
  { term: "Casting off", meaning: "Releasing the boat from its mooring" },
  { term: "Trolling", meaning: "Fishing by trailing a baited line behind a boat" },
  { term: "Chum", meaning: "Food (typically fresh chunks of fish meat with bone and blood) used to attract other fish" },
  { term: "Chumming", meaning: "Throwing bait into the water to attract fish" },
  { term: "Bait", meaning: "What is attached to the hook to attract fish" },
  { term: "Catch and release", meaning: "Catching fish and returning them to the water" },
  // Add more as needed
]

const videos = [
  {
    title: "Tying a fishing knot",
    embedUrl: "https://www.youtube.com/embed/12suga1qwEs?si=7dlK3fFApnxAnA5B"
  },
  {
    title: "Understanding Weather at Sea",
    embedUrl: "https://www.youtube.com/embed/g-Zn_6DoRqM?si=E1Sp5N7I5_0SQJ2X"
  },
  {
    title: "Tossing a line",
    embedUrl: "https://www.youtube.com/embed/5ZFZO7B2304?si=l6Y-YwHSuCWODV-Y"
  }
  
]

const videoDialog = ref(false)
const selectedVideo = ref(null)

function openVideo(video) {
  selectedVideo.value = video
  videoDialog.value = true
}
</script>