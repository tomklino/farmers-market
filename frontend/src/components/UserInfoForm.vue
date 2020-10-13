<template>
  <v-card>
    <v-card-text>
      <v-form class="pa-9" v-model="valid">
        <v-text-field
          v-model="name"
          type="text"
          :label="$t('your_full_name')"
          :rules="nameRules"
          ></v-text-field>
        <v-text-field
          v-model="email"
          type="text"
          :label="$t('email_address')"
          :rules="emailRules"
          ></v-text-field>
        <v-text-field
          v-model="phone"
          type="text"
          :label="$t('phone_number')"
          :rules="phoneRules"
          ></v-text-field>
          <v-btn color="success" @click="submit" :disabled="!valid">{{ $t('submit') }}</v-btn>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<script>
import store from '@/store';

export default {
  name: "UserInfoForm",
  data: () => ({
    valid: false,
    //// TODO: make sure the name/email/phone are being filled in they exist
    name: "",
    email: "",
    phone: ""
  }),
  computed: {
    emailRules() {
      return [
        v => !!v || this.$t('email_is_required'),
        (v) => {
          let atIndex = v.indexOf("@");
          if (atIndex <= 0) {
            return this.$t("email_is_invalid")
          }
          let userPart = v.split("@")[0];
          let domainPart = v.split("@")[1];
          let dotIndex = domainPart.indexOf(".");
          return (userPart.length > 0 && dotIndex !== -1 && dotIndex < (domainPart.length - 1))
        }
      ]
    },
    nameRules() {
      return [
        v => !!v || this.$t('name_is_required')
      ]
    },
    phoneRules() {
      return [
        v => !!v || this.$t('phone_is_required')
        // TODO match phone regex
      ]
    }
  },
  methods: {
    isLoggedIn() {
      return store.state.loggedInUser.loggedIn;
    },
    async submit() {
      if(!this.valid) {
        return;
      }
      const userInfo = { name: this.name, email: this.email, phone: this.phone };
      if(this.isLoggedIn()) {
        await store.dispatch("persistUserInfo", userInfo);
      }
      this.$emit("input", userInfo);
    }
  }
}

</script>
