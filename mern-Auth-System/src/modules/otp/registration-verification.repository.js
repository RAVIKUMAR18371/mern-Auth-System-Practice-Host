const RegistrationVerification =
  require("./registration-verification.model");

class RegistrationVerificationRepository {

  async findByEmail(email) {
    return await RegistrationVerification.findOne({
      email: email.toLowerCase(),
    });
  }

  async create(data) {
    return await RegistrationVerification.create(
      data
    );
  }

  async updateById(id, data) {
    return await RegistrationVerification.findByIdAndUpdate(
      id,
      data,
      {
        new: true,
      }
    );
  }

  async deleteById(id) {
    return await RegistrationVerification.findByIdAndDelete(
      id
    );
  }
}

module.exports =
  new RegistrationVerificationRepository();