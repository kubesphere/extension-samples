package models

import (
	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
)

var DB *gorm.DB

type Employee struct {
	gorm.Model
	ID    int    `json:"id"`
	Name  string `json:"name"`
	Email string `json:"email"`
	Age   int    `json:"age"`
}

func ConnectDatabase() error {
	db, err := gorm.Open(sqlite.Open("./data.db"), &gorm.Config{})
	if err != nil {
		return err
	}

	db.AutoMigrate(&Employee{})

	DB = db
	return nil
}

func GetEmployees(count int, isDelete string) ([]Employee, error) {
	var employees []Employee

	if isDelete == "1" {
		if result := DB.Unscoped().Limit(count).Where("deleted_at <> ?", "").Find(&employees); result.Error != nil {
			return nil, result.Error
		}
	} else {
		if result := DB.Limit(count).Find(&employees); result.Error != nil {
			return nil, result.Error
		}
	}

	return employees, nil
}

func GetEmployeeCount(isDelete string) (int64, error) {
	var count int64

	if isDelete == "1" {
		if result := DB.Model(&Employee{}).Unscoped().Where("deleted_at <> ?", "").Count(&count); result.Error != nil {
			return 0, result.Error
		}
	} else {
		if result := DB.Model(&Employee{}).Count(&count); result.Error != nil {
			return 0, result.Error
		}
	}

	return count, nil
}

func GetEmployeeById(id string) (Employee, error) {
	employee := Employee{}

	if result := DB.Where("id = ?", id).First(&employee); result.Error != nil {
		return employee, result.Error
	}

	return employee, nil
}

func CreateEmployee(employee Employee) (bool, error) {
	if result := DB.Create(&employee); result.Error != nil {
		return false, result.Error
	}

	return true, nil
}

func UpdateEmployee(employee Employee, id int) (bool, error) {
	if result := DB.Model(&employee).Where("id = ?", id).Updates(&employee); result.Error != nil {
		return false, result.Error
	}

	return true, nil
}

func DeleteEmployee(id int) (bool, error) {
	employee := Employee{}

	if result := DB.Where("id = ?", id).First(&employee); result.Error != nil {
		return false, result.Error
	}

	DB.Delete(&employee)

	return true, nil
}
