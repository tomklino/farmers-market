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
          :disabled="isEmailDisabled"
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
  }),
  computed: {
    name: {
      get() { return store.state.userInfo.name },
      set(value) {
        store.commit('setUserInfoAttribute', { key: 'name', value });
      }
    },
    nameRules() {
      return [
        v => !!v || this.$t('name_is_required')
      ]
    },
    email: {
      get() { return store.state.userInfo.email },
      set(value) {
        store.commit('setUserInfoAttribute', { key: 'email', value });
      }
    },
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
    isEmailDisabled() {
      return store.state.loggedInUser.withGoogle &&
             typeof store.state.userInfo.email === 'string'
    },
    phone: {
      get() { return store.state.userInfo.phone },
      set(value) {
        store.commit('setUserInfoAttribute', { key: 'phone', value });
      }
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
