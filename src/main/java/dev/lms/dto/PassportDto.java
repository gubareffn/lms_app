package dev.lms.dto;

import dev.lms.models.Group;
import dev.lms.models.Passport;
import jakarta.persistence.Column;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
public class PassportDto {
    private Integer id;
    private String series;
    private String number;
    private String issuedBy;
    private LocalDate issuedDate;
    private LocalDate dateOfBirth;

    public PassportDto(Passport passport) {
        this.id = passport.getId();
        this.series = passport.getSeries();
        this.number = passport.getNumber();
        this.issuedBy = passport.getIssuedBy();
        this.issuedDate = passport.getIssuedDate();
        this.dateOfBirth = passport.getDateOfBirth();
    }
}
